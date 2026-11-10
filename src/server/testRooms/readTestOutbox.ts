import * as v from "valibot";
import { TestOutboxRequest } from "../../shared/api/TestOutboxRequest";
import { TestOutboxResponse } from "../../shared/api/TestOutboxResponse";
import { bodyOf } from "../api/bodyOf";
import { hasTestRoomSecret } from "./hasTestRoomSecret";

export async function readTestOutbox(request: Request, env: Env): Promise<Response> {
  if (!(await hasTestRoomSecret(request, env))) {
    return new Response("Not found", { status: 404 });
  }
  const body = await bodyOf(request, TestOutboxRequest);
  if (body === null) {
    return new Response("Bad request", { status: 400 });
  }
  const { results } = await env.DB.prepare(
    "SELECT subject, text FROM test_outbox WHERE to_address = ? ORDER BY id DESC",
  )
    .bind(body.to)
    .all();
  const reply: TestOutboxResponse = { emails: v.parse(TestOutboxResponse.entries.emails, results) };
  return Response.json(reply);
}
