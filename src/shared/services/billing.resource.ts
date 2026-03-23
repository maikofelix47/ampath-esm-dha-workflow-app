import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import {
  type CreateBillDto,
  type BillableService,
  type PaymentMode,
  type CashPoint,
  type UpdateBillDto,
} from '../types';
import { type Bill } from '../../billing/types';

export async function fetchPaymentModes(): Promise<PaymentMode[]> {
  const paymentModeUrl = `${restBaseUrl}/billing/paymentMode`;
  const resp = await openmrsFetch(paymentModeUrl);
  const data = await resp.json();
  return data.results ?? [];
}

export async function fetchBillableServices(): Promise<BillableService[]> {
  const v = 'full';
  const billableServiceUrl = `${restBaseUrl}/billing/billableService`;
  const resp = await openmrsFetch(`${billableServiceUrl}?v=${v}`);
  const data = await resp.json();
  return data.results ?? [];
}

export async function createBill(createBillDto: CreateBillDto) {
  const createBillUrl = `${restBaseUrl}/billing/bill`;
  const response = await openmrsFetch(createBillUrl, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify(createBillDto),
  });
  const result = await response.json();
  return result.results ?? [];
}

export async function fetchCashPoints(): Promise<CashPoint[]> {
  const v = 'full';
  const cashPointUrl = `${restBaseUrl}/billing/cashPoint?v=${v}`;
  const resp = await openmrsFetch(cashPointUrl);
  const data = await resp.json();
  return data.results ?? [];
}

export async function fetchPatientBills(patientUuid: string): Promise<Bill[]> {
  const v = 'full';
  const patientBillUrl = `${restBaseUrl}/billing/bill?v=full&patientUuid=${patientUuid}`;
  const resp = await openmrsFetch(patientBillUrl);
  const data = await resp.json();
  return data.results ?? [];
}

export async function fetchPatientTodaysLatestPendingBill(patientUuid: string): Promise<Bill | null> {
  const bills = await fetchPatientBills(patientUuid);
  // get todays latest pending bill
  if (bills.length > 0) {
    return getPatientTodaysLatestPendingBill(bills);
  } else {
    return null;
  }
}

export function getPatientTodaysLatestPendingBill(bills: Bill[]): Bill | null {
  const today = new Date();
  const todaysLatestBills: Bill[] = getPatientTodaysBills(bills).sort((a, b) => {
    return b.dateCreated.localeCompare(a.dateCreated);
  });
  const todaysPendingBills = getPatientPendingBills(todaysLatestBills);
  if (todaysLatestBills.length > 0) {
    return todaysPendingBills[0];
  } else {
    return null;
  }
}

export function getPatientTodaysBills(bills: Bill[]): Bill[] {
  if (!bills) {
    return [];
  }
  const today = new Date();
  const todaysBills: Bill[] = bills.filter((b) => {
    const billDate = new Date(b.dateCreated);
    return (
      billDate.getFullYear() === today.getFullYear() &&
      billDate.getMonth() === today.getMonth() &&
      billDate.getDate() === today.getDate()
    );
  });
  return todaysBills;
}

export function getPatientPendingBills(bills: Bill[]): Bill[] {
  if (!bills) {
    return [];
  }
  return bills.filter((b) => {
    return b.status === 'PENDING';
  });
}

export async function updateBill(billUuid: string, updateBillDto: UpdateBillDto) {
  const createBillUrl = `${restBaseUrl}/billing/bill/${billUuid}`;
  const response = await openmrsFetch(createBillUrl, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify(updateBillDto),
  });
  const result = await response.json();
  return result.results ?? [];
}
