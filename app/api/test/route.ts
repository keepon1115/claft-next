export async function GET() {
  return Response.json({ 
    message: 'Server is working!', 
    timestamp: new Date().toISOString() 
  })
} 