const MAILERLITE_API_KEY = process.env.MAILERLITE_API_KEY!;
const MAILERLITE_GROUP_ID = process.env.MAILERLITE_GROUP_ID!;

interface SubscriberData {
  email: string;
  name?: string;
  fields?: Record<string, string>;
}

export async function addSubscriber(data: SubscriberData): Promise<boolean> {
  const response = await fetch("https://connect.mailerlite.com/api/subscribers", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${MAILERLITE_API_KEY}`,
    },
    body: JSON.stringify({
      email: data.email,
      fields: {
        name: data.name || "",
        ...data.fields,
      },
      groups: [MAILERLITE_GROUP_ID],
    }),
  });

  return response.ok;
}

export async function updateSubscriber(
  email: string,
  fields: Record<string, string>
): Promise<boolean> {
  const response = await fetch(
    `https://connect.mailerlite.com/api/subscribers/${encodeURIComponent(email)}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${MAILERLITE_API_KEY}`,
      },
      body: JSON.stringify({ fields }),
    }
  );

  return response.ok;
}
