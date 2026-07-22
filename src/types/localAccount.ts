export interface LocalAccount {
  id: string;
  firstName: string;
  lastName: string;
  createdAt: string;
}

export function getLocalAccountDisplayName(account: LocalAccount): string {
  return `${account.firstName} ${account.lastName}`.trim();
}
