module.exports = async function reverseProxy(request, servicePath, apiDocsID) {
    const apidogUrl = new URL(request.url)
    apidogUrl.hostname = `accounts.apidog.io`
    apidogUrl.pathname = apidogUrl.pathname.replace(`${servicePath}/docs`, '')

    const apidogRequest = new Request(apidogUrl, {
        method: request.method,
        headers: request.headers,
        body: request.body
    })

    apidogRequest.headers.set('X-Apidog-Docs-Site-ID', apiDocsID)
    apidogRequest.headers.set('Host', `api.gycoding.com`)

    return fetch(apidogRequest)
}