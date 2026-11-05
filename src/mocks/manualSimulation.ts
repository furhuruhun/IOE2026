import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { mockEvents } from "./events";
import { mockCompetitions } from "./competitions";
import { mockCompetitionDetails } from "./competitionDetails";
import { profileSchema } from "@/features/profile/schemas";
import { validateDocument } from "@/utils/validateDocument";
import { SIMULATION_COOKIE } from "@/lib/manualSimulation";
import type { User } from "@/types/auth";

const scenarios = ['success', 'validation', 'closed', 'full', 'already-registered', 'expired', 'before-commit', 'after-commit', 'dashboard-error'] as const;
const stateSchema = z.object({
  version: z.literal(1), scenario: z.enum(scenarios), sessions: z.array(z.string()),
  user: z.object({ id: z.literal('simulation-participant'), name: z.string(), email: z.string(), role: z.literal('peserta'), avatarUrl: z.null(), institution: z.string().nullable(), phone: z.string().nullable(), domicile: z.string().nullable() }),
  registrations: z.array(z.object({ slug: z.string(), registrationId: z.string(), sessionType: z.string(), date: z.string().optional() })),
});
type State = z.infer<typeof stateSchema>;
const directory = path.join(process.cwd(), 'out', 'manual-simulation');
const file = path.join(directory, 'state.json');
function seed(): State {
  return { version: 1, scenario: 'success', sessions: [], registrations: [], user: { id: 'simulation-participant', name: 'Simulation Participant', email: 'participant@example.test', role: 'peserta', avatarUrl: null, institution: 'Synthetic Institute', phone: '08123456789', domicile: 'Bandung' } };
}
const headers = { 'X-IOE-Simulation': 'true', 'Cache-Control': 'private, no-store' };
const ok = (data: unknown) => NextResponse.json({ success: true, data }, { headers });
function fail(code: string, status: number, message = 'Local simulation response', fields?: Record<string, string>) {
  return NextResponse.json({ success: false, error: { code, message, ...(fields ? { fields } : {}) } }, { status, headers });
}
function session(response: NextResponse, token: string) {
  response.cookies.set(SIMULATION_COOKIE, token, { httpOnly: true, sameSite: 'strict', path: '/', maxAge: token ? 86400 : 0 });
  return response;
}
function events(state: State) {
  return mockEvents.map(event => ({ ...event, name: `[Simulation] ${event.name}`, deadline: state.scenario === 'closed' ? '2000-01-01T00:00:00+07:00' : '2099-03-05T23:59:00+07:00', isRegisteredByUser: state.scenario === 'already-registered' || state.registrations.some(item => item.slug === event.slug), speakers: [{ id: 'simulation-speaker-a', name: 'Synthetic Speaker A' }, { id: 'simulation-speaker-b', name: 'Synthetic Speaker B' }] }));
}
async function dispatch(request: NextRequest, pathname: string, state: State): Promise<NextResponse> {
  const method = request.method;
  const token = request.cookies.get(SIMULATION_COOKIE)?.value;
  const authenticated = Boolean(token && state.sessions.includes(token));
  if (pathname === '/api/simulation') {
    if (method === 'GET') return ok({ scenario: state.scenario });
    if (method !== 'POST') return fail('NOT_FOUND', 405);
    const body = await request.json();
    if (body.action === 'reset') { Object.assign(state, seed()); return session(ok(null), ''); }
    if (body.action !== 'scenario' || !scenarios.includes(body.scenario)) return fail('VALIDATION_ERROR', 400);
    state.scenario = body.scenario;
    if (state.scenario === 'expired') { state.sessions = []; return session(ok(null), ''); }
    return ok({ scenario: state.scenario });
  }
  if (pathname === '/api/auth/login' && method === 'POST') {
    const body = await request.json();
    if (body.email !== 'participant@example.test' || body.password !== 'Simulation123!') return fail('INVALID_CREDENTIALS', 401);
    const value = `simulation-${randomUUID()}`;
    state.sessions.push(value);
    return session(ok({ user: state.user satisfies User }), value);
  }
  if (pathname === '/api/auth/logout' && method === 'POST') {
    state.sessions = state.sessions.filter(value => value !== token);
    return session(ok(null), '');
  }
  if (pathname === '/api/auth/me' && method === 'GET') return session(ok(authenticated ? state.user : null), authenticated ? token! : '');
  if (pathname === '/api/events' && method === 'GET') return ok(events(state));
  if (pathname === '/api/competitions' && method === 'GET') return ok(mockCompetitions);
  if (/^\/api\/competitions\/[^/]+$/.test(pathname) && method === 'GET') {
    const item = mockCompetitionDetails.find(item => item.slug === pathname.split('/')[3]);
    return item ? ok(item) : fail('NOT_FOUND', 404);
  }
  const match = /^\/api\/events\/([^/]+)(\/register)?$/.exec(pathname);
  if (match) {
    const event = events(state).find(item => item.slug === decodeURIComponent(match[1]));
    if (!event) return fail('NOT_FOUND', 404);
    if (!match[2] && method === 'GET') return ok(event);
    if (match[2] && method === 'POST') {
      if (!authenticated) return session(fail('UNAUTHORIZED', 401), '');
      if (!['talkshow', 'short-course'].includes(event.slug)) return fail('NOT_FOUND', 404, 'This registration is outside the simulation scope');
      if (event.isRegisteredByUser) return fail('ALREADY_REGISTERED', 400);
      if (state.scenario === 'closed') return fail('REGISTRATION_CLOSED', 400);
      if (state.scenario === 'full') return fail('QUOTA_FULL', 400);
      const form = await request.formData();
      const fields: Record<string, string> = {};
      for (const name of ['phone', 'institution', 'domicile']) if (typeof form.get(name) !== 'string' || !String(form.get(name)).trim()) fields[name] = 'Required simulation field';
      if (state.scenario === 'validation') fields.phone = 'Synthetic server-side phone rejection';
      const type = form.get('sessionType');
      if (type !== 'seminar' && type !== 'workshop') fields.sessionType = 'Choose seminar or workshop';
      if (type === 'workshop' && !event.speakers.some(speaker => speaker.id === form.get('speakerId'))) fields.speakerId = 'Choose a synthetic speaker';
      for (const name of ['cvFile', 'paymentProof']) {
        const upload = form.get(name);
        if (upload instanceof File && upload.size) {
          const error = validateDocument(upload, name === 'cvFile' ? ['pdf'] : ['jpg', 'png']);
          if (error) fields[name] = error;
        }
      }
      if (Object.keys(fields).length) return fail('VALIDATION_ERROR', 400, 'Synthetic field validation', fields);
      if (state.scenario === 'before-commit') return fail('SERVER_ERROR', 503);
      const registrationId = `simulation-${randomUUID()}`;
      // Synthetic schedule only; persist it so refresh/restart keeps the same date.
      const date = new Date(Date.now() + 7 * 86400000).toISOString();
      state.registrations.push({ slug: event.slug, sessionType: String(type), registrationId, date });
      if (state.scenario === 'after-commit') return fail('SERVER_ERROR', 502, 'Synthetic response failure after persistence');
      return ok({ registrationId });
    }
  }
  if (pathname === '/api/profile' && ['GET', 'PUT'].includes(method)) {
    if (!authenticated) return session(fail('UNAUTHORIZED', 401), '');
    if (method === 'PUT') {
      const result = profileSchema.safeParse(await request.json());
      if (!result.success) return fail('VALIDATION_ERROR', 400);
      state.user = { ...state.user, ...result.data };
    }
    return ok(state.user);
  }
  if (pathname.startsWith('/api/dashboard/') && method === 'GET') {
    if (!authenticated) return session(fail('UNAUTHORIZED', 401), '');
    if (state.scenario === 'dashboard-error' && state.registrations.length) return fail('SERVER_ERROR', 503);
    const registered = state.registrations.map(item => {
      const event = events(state).find(event => event.slug === item.slug)!;
      return { eventId: event.id, slug: event.slug, name: event.name, sessionType: item.sessionType, date: item.date ?? '2099-03-06T09:00:00+07:00' };
    });
    if (pathname === '/api/dashboard/events') return ok(registered);
    if (pathname === '/api/dashboard/calendar') return ok(registered.map(item => ({ date: item.date, label: item.name, type: 'event', refId: item.eventId, logoUrl: null })));
    if (['/api/dashboard/journey', '/api/dashboard/assignments'].includes(pathname)) return ok([]);
  }
  return fail('NOT_FOUND', 404, 'Unsupported local simulation request; no backend fallback');
}

// ponytail: one local server process; use a database if multi-process testing becomes required.
const shared = globalThis as typeof globalThis & { ioeSimulationQueue?: Promise<unknown> };
export async function simulate(request: NextRequest) {
  const task = (shared.ioeSimulationQueue ?? Promise.resolve()).then(async () => {
    const pathname = request.headers.get('x-ioe-simulation-path') ?? '';
    // The reset control can recover malformed state, but storage failures still fail closed.
    let state: State;
    try { state = stateSchema.parse(JSON.parse(await readFile(file, 'utf8'))); }
    catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') state = seed();
      else if (pathname === '/api/simulation' && request.method === 'POST' && (await request.clone().json()).action === 'reset') state = seed();
      else throw error;
    }
    const response = await dispatch(request, pathname, state);
    await mkdir(directory, { recursive: true });
    const temporary = path.join(directory, 'state.tmp');
    await writeFile(temporary, JSON.stringify(state), 'utf8');
    await rename(temporary, file);
    return response;
  });
  shared.ioeSimulationQueue = task.catch(() => {});
  try { return await task; }
  catch { return fail('SERVER_ERROR', 503, 'Local simulation storage or request error; no backend fallback'); }
}
