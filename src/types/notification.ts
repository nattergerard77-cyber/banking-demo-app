export type NotificationCategory =
  | "security"
  | "operations"
  | "documents"
  | "service";

export type NotificationFilter = "all" | "unread" | NotificationCategory;

export type NotificationPreferences = Record<NotificationCategory, boolean>;

export type NotificationItem = {
  id: string;
  titleKey: string;
  descriptionKey: string;
  detailKey: string;
  dateLabelKey: string;
  time?: string;
  category: NotificationCategory;
  read: boolean;
  amount?: string;
  reference?: string;
  beneficiary?: string;
};
