export async function GET() {
  const securityPolicy = `Contact: mailto:mrshanshuvo@gmail.com
Expires: 2028-12-31T23:59:59.000Z
Preferred-Languages: en
Canonical: https://shahidhasanshuvo.vercel.app/.well-known/security.txt
Policy: https://github.com/mrshanshuvo/shahidhasanshuvo/security/policy
`;

  return new Response(securityPolicy, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
