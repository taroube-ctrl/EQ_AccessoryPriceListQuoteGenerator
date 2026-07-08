export function ServiceCredentialsGuide() {
  return (
    <div className="rounded border border-blue-200 bg-blue-50 px-3 py-3 text-sm text-blue-950">
      <p className="fw-semibold mb-2">Server-side credentials (no visitor sign-in)</p>
      <p className="mb-2">
        Live Excel data uses <strong>your</strong> Azure app registration on the Express server.
        Secrets stay in <code>.env</code> and are never sent to the browser.
      </p>
      <ol className="mb-2 ps-3">
        <li className="mb-1">
          App registration → <strong>Certificates &amp; secrets</strong> → create a client secret.
        </li>
        <li className="mb-1">
          <strong>API permissions</strong> → Microsoft Graph → <strong>Application permissions</strong>{' '}
          → add <code>Files.Read.All</code>.
        </li>
        <li className="mb-1">
          Click <strong>Grant admin consent</strong>.
        </li>
        <li className="mb-1">
          Set <code>AZURE_TENANT_ID</code>, <code>AZURE_CLIENT_ID</code>,{' '}
          <code>AZURE_CLIENT_SECRET</code>, and <code>AZURE_DRIVE_USER_EMAIL</code> in{' '}
          <code>.env</code>.
        </li>
        <li>
          Run <code>npm run dev:full</code> (Vite + API server on port 3001).
        </li>
      </ol>
    </div>
  );
}
