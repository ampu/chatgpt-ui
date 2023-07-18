import { createProxyMiddleware } from 'http-proxy-middleware'

export default defineEventHandler(async (event) => {
    const handler = createProxyMiddleware({
        target: process.env.SERVER_DOMAIN,
        pathFilter: '/api',
    })
    await new Promise<void>((resolve, reject) => {
        handler(event.node.req, event.node.res, (err) => {
            if (err) {
                reject(err)
                return
            }
            resolve()
        })
    })
})
