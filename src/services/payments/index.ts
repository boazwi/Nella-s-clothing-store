import { stripePaymentsService } from "./stripePaymentsService";
import type { PaymentsService } from "./types";

export const paymentsService: PaymentsService = stripePaymentsService;
export type { PaymentsService } from "./types";
