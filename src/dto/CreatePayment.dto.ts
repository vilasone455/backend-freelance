
export interface CreatePaymentDto{

    id ?: number

    paymentName: string;

    paymentImage: string;

    amount: number;

    order : number
}