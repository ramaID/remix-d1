import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { Form, json, useLoaderData } from "@remix-run/react";
import { drizzle } from "drizzle-orm/d1";
import { resources } from "~/db/schema.server";

export async function action({ request, context }: ActionFunctionArgs) {
  const env = context.cloudflare.env as Env
  const formData = await request.formData();
  const title = formData.get("title") as string;
  const href = formData.get("href") as string;
  const db = drizzle(env.DB);

  await db.insert(resources).values({ title, href }).execute();

  return json({ message: "Resource added" }, { status: 201 });
}

export async function loader({ context }: LoaderFunctionArgs) {
  const env = context.cloudflare.env as Env
  const db = drizzle(env.DB);
  const resourceList = await db
    .select({
      id: resources.id,
      title: resources.title,
      href: resources.href,
    })
    .from(resources)
    .orderBy(resources.id);

  return json({
    resourceList,
  });
}

export default function ResourcesPage() {
  const { resourceList } = useLoaderData<typeof loader>();
  return (
    <div>
      <h1>Welcome to Remix (with Drizzle, Vite and Cloudflare D1)</h1>
      <ol>
        {resourceList.map((resource) => (
          <li key={resource.id}>
            <a target="_blank" href={resource.href} rel="noreferrer">
              {resource.title}
            </a>
          </li>
        ))}
      </ol>
      <Form method="POST">
        <div>
          <label>
            Title: <input type="text" name="title" required />
          </label>
        </div>
        <div>
          <label>
            URL: <input type="url" name="href" required />
          </label>
        </div>
        <button type="submit">Add Resource</button>
      </Form>
    </div>
  );
}
