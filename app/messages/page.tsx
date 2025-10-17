import MessagesClient from './MessagesClient'

export default function MessagesPage() {
    // App Routerではサーバー側でラップしてCSRコンポーネントを描画する
    return <MessagesClient />
}


