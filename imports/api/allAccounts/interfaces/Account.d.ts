interface AccountContactEventType {
  event: string;
  timestamp: Date;
}

export interface AccountContactType {
  contactType?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  mail?: string;
  linkedId?: string;
  userId?: string;
  events?: Array<AccountContactEventType>;
}
