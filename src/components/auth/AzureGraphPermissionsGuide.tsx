import { graphDelegatedPermissions } from '../../authConfig';

export function AzureGraphPermissionsGuide({ compact = false }: { compact?: boolean }) {
  const fileScope = graphDelegatedPermissions.includes('Files.Read.All')
    ? 'Files.Read.All'
    : 'Files.Read';

  if (compact) {
    return (
      <p className="text-muted small mb-0">
        Azure app needs <strong>Microsoft Graph</strong> delegated permissions:{' '}
        <code>User.Read</code> and <code>{fileScope}</code>.
      </p>
    );
  }

  return (
    <div className="rounded border border-blue-200 bg-blue-50 px-3 py-3 text-sm text-blue-950">
      <p className="fw-semibold mb-2 mb-0">Grant OneDrive / SharePoint file access</p>
      <ol className="mb-2 ps-3">
        <li className="mb-1">
          In your app registration, open <strong>API permissions</strong> →{' '}
          <strong>Add a permission</strong>.
        </li>
        <li className="mb-1">
          Choose <strong>Microsoft Graph</strong> → <strong>Delegated permissions</strong>.
        </li>
        <li className="mb-1">
          Search for and check <code>User.Read</code> and{' '}
          <code>{fileScope}</code>
          {fileScope === 'Files.Read' && (
            <>
              {' '}
              (use <code>Files.Read.All</code> if the workbook lives on a shared team site — set{' '}
              <code>VITE_AZURE_FILES_READ_ALL=true</code> in <code>.env</code>)
            </>
          )}
          .
        </li>
        <li className="mb-1">
          Click <strong>Add permissions</strong>, then <strong>Grant admin consent</strong> if your
          org requires it.
        </li>
        <li>Sign out and sign in again so the new scopes take effect.</li>
      </ol>
      <p className="mb-0 text-muted small">
        This app requests:{' '}
        {graphDelegatedPermissions.map((scope) => (
          <code key={scope} className="me-1">
            {scope}
          </code>
        ))}
      </p>
    </div>
  );
}
