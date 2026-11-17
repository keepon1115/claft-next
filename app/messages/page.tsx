import MessagesClient from './MessagesClient'
import { Suspense } from 'react'

export default function MessagesPage() {
    // App Routerでは useSearchParams を使うクライアントを Suspense でラップする必要がある
    return (
        <Suspense fallback={null}>
            <MessagesClient />
        </Suspense>
    )
}


