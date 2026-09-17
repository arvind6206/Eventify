import { FormEvent, useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Modal } from "./ui";
import { Reservation } from "./types";
import { formatMoney } from "./ui";

interface PaymentFormProps {
  reservation: Reservation;
  close: () => void;
  submitPayment: (data: { reservationId: string; method: string }) => Promise<void>;
}

export function PaymentForm({ reservation, close, submitPayment }: PaymentFormProps) {
  const [paymentMethod, setPaymentMethod] = useState("CARD");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    try {
      await submitPayment({
        reservationId: reservation.id,
        method: paymentMethod,
      });
      close();
    } catch (error) {
      console.error("Payment failed:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal title="Complete payment" close={close}>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Reservation summary</CardTitle>
            <CardDescription>Review your reservation details before payment</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-600">Reservation ID</span>
                <span className="font-mono text-sm">{reservation.id.slice(0, 8)}...</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Quantity</span>
                <span className="font-medium">{reservation.quantity} ticket(s)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Status</span>
                <span className="font-medium">{reservation.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Expires at</span>
                <span className="font-medium text-sm">
                  {new Date(reservation.expiresAt).toLocaleString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="paymentMethod">Payment method</Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CARD">Credit/Debit Card</SelectItem>
                <SelectItem value="UPI">UPI</SelectItem>
                <SelectItem value="NET_BANKING">Net Banking</SelectItem>
                <SelectItem value="WALLET">Wallet</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {paymentMethod === "CARD" && (
            <Card>
              <CardContent className="pt-4 space-y-4">
                <div>
                  <Label htmlFor="cardNumber">Card number</Label>
                  <Input
                    id="cardNumber"
                    placeholder="4242 4242 4242 4242"
                    className="mt-2"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="expiry">Expiry date</Label>
                    <Input
                      id="expiry"
                      placeholder="MM/YY"
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="cvv">CVV</Label>
                    <Input
                      id="cvv"
                      placeholder="123"
                      className="mt-2"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {paymentMethod === "UPI" && (
            <Card>
              <CardContent className="pt-4">
                <div>
                  <Label htmlFor="upiId">UPI ID</Label>
                  <Input
                    id="upiId"
                    placeholder="yourname@upi"
                    className="mt-2"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {paymentMethod === "NET_BANKING" && (
            <Card>
              <CardContent className="pt-4">
                <div>
                  <Label htmlFor="bank">Select bank</Label>
                  <Select>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Choose your bank" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SBI">State Bank of India</SelectItem>
                      <SelectItem value="HDFC">HDFC Bank</SelectItem>
                      <SelectItem value="ICICI">ICICI Bank</SelectItem>
                      <SelectItem value="AXIS">Axis Bank</SelectItem>
                      <SelectItem value="KOTAK">Kotak Mahindra Bank</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={close} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? "Processing..." : "Pay now"}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}