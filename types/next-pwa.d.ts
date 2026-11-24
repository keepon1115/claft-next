// next-pwa does not ship its own types; @types/next-pwa pulled in an old Next.js 13.
declare module 'next-pwa' {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const withPWA: (options: Record<string, unknown>) => (config: any) => any
  export default withPWA
}
