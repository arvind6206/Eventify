import { FormEvent, useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Modal } from "./ui";
import { EventRecord, TicketType } from "./types";
import { formatMoney } from "./ui";

interface BookingFlowProps {
  event: EventRecord;
  ticketTypes: TicketType[];
  close: () => void;
  submitReservation: (data: any) => Promise<void>;
  submitPayment: (data: { reservationId: string; method: string }) => Promise<void>;
}



export function BookingFlow({ event, ticketTypes, close, submitReservation, submitPayment }: BookingFlowProps) {
  const [selectedTicketType, setSelectedTicketType] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("CARD");
  const [step, setStep] = useState<"select" | "payment">("select");
  const [reservationId, setReservationId] = useState<string | null>(null);

  const selectedTicket = ticketTypes.find(t => t.id === selectedTicketType);
  const totalAmount = selectedTicket ? selectedTicket.price * quantity : 0;

  async function handleReservation(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selectedTicketType) return;

    setLoading(true);
    try {
      const reservation = await submitReservation({
        eventId: event.id,
        ticketTypeId: selectedTicketType,
        quantity,
      });
      // submitReservation now returns the reservation data
      setReservationId(reservation?.id || null);
      setStep("payment");
    } catch (error) {
      console.error("Reservation failed:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handlePayment(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!reservationId) return;

    setLoading(true);
    try {
      await submitPayment({
        reservationId,
        method: paymentMethod,
      });
      close();
    } catch (error) {
      console.error("Payment failed:", error);
    } finally {
      setLoading(false);
    }
  }

  if (ticketTypes.length === 0) {
    return (
      <Modal title="Book tickets" close={close}>
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-slate-500">
              No ticket types available for this event yet.
            </p>
          </CardContent>
        </Card>
      </Modal>
    );
  }

  return (
    <Modal title={`Book tickets for ${event.title}`} close={close}>
      <div className="space-y-6">
        <Card className="border-violet-100 bg-gradient-to-br from-violet-50 to-white">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-slate-900">{event.title}</CardTitle>
            <CardDescription className="text-slate-600">{event.description || "Select your tickets below"}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 flex-wrap">
              <Badge variant="info" className="bg-violet-100 text-violet-700 border-violet-200">{event.category}</Badge>
              <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 border-emerald-200">{event.status}</Badge>
            </div>
          </CardContent>
        </Card>

        {step === "select" ? (
          <form onSubmit={handleReservation} className="space-y-6">
            <div>
              <Label htmlFor="ticketType" className="text-base font-semibold text-slate-800">Select ticket type</Label>
              <Select value={selectedTicketType} onValueChange={setSelectedTicketType}>
                <SelectTrigger className="mt-3 h-12 border-slate-200 focus:border-violet-400 focus:ring-violet-100">
                  <SelectValue placeholder="Choose a ticket type" />
                </SelectTrigger>
                <SelectContent>
                  {ticketTypes.map((ticket) => (
                    <SelectItem key={ticket.id} value={ticket.id}>
                      <div className="flex justify-between w-full items-center">
                        <span className="font-medium">{ticket.name}</span>
                        <span className="text-violet-600 font-bold">{formatMoney(ticket.price)}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedTicket && (
              <Card className="border-violet-100 bg-violet-50/50">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">{selectedTicket.name}</h3>
                      {selectedTicket.description && (
                        <p className="text-sm text-slate-600 mt-1">{selectedTicket.description}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-violet-600">{formatMoney(selectedTicket.price)}</p>
                      <p className="text-xs text-slate-500 mt-1">per ticket</p>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-violet-100">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">Available tickets</span>
                      <span className="font-semibold text-emerald-600">{selectedTicket.quantity}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <div>
              <Label htmlFor="quantity" className="text-base font-semibold text-slate-800">Quantity</Label>
              <div className="flex items-center gap-4 mt-3">
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                  className="h-12 w-12 rounded-full"
                >
                  -
                </Button>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  max={selectedTicket?.quantity || 1}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Math.min(selectedTicket?.quantity || 1, parseInt(e.target.value) || 1)))}
                  className="h-12 text-center text-lg font-semibold border-slate-200 focus:border-violet-400 focus:ring-violet-100"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={() => setQuantity(Math.min(selectedTicket?.quantity || 1, quantity + 1))}
                  disabled={quantity >= (selectedTicket?.quantity || 1)}
                  className="h-12 w-12 rounded-full"
                >
                  +
                </Button>
              </div>
            </div>

            {selectedTicket && (
              <Card className="bg-gradient-to-br from-slate-900 to-slate-800 text-white border-0">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-slate-400 uppercase tracking-wide">Total amount</p>
                      <p className="text-3xl font-bold mt-1">{formatMoney(totalAmount)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-400">{quantity} × {formatMoney(selectedTicket.price)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="flex gap-4 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={close} 
                className="flex-1 h-12 border-slate-200 text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="flex-1 h-12 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white font-semibold" 
                disabled={!selectedTicketType || loading}
              >
                {loading ? "Processing..." : "Continue to payment →"}
              </Button>
            </div>
          </form>
        ) : (
          <form onSubmit={handlePayment} className="space-y-6">
            <Card className="border-violet-100 bg-gradient-to-br from-violet-50 to-white">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-slate-900">Payment Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-slate-100">
                    <span className="text-slate-600">Event</span>
                    <span className="font-medium text-slate-900">{event.title}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-100">
                    <span className="text-slate-600">Ticket type</span>
                    <span className="font-medium text-slate-900">{selectedTicket?.name}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-100">
                    <span className="text-slate-600">Quantity</span>
                    <span className="font-medium text-slate-900">{quantity}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 bg-violet-50 rounded-lg px-4">
                    <span className="font-semibold text-slate-900">Total</span>
                    <span className="text-2xl font-bold text-violet-600">{formatMoney(totalAmount)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div>
              <Label htmlFor="paymentMethod" className="text-base font-semibold text-slate-800">Payment method</Label>
              <div className="grid grid-cols-2 gap-3 mt-3">
                {[
                  { value: "CARD", label: "Card", icon: "💳" },
                  { value: "UPI", label: "UPI", icon: "📱" },
                  { value: "NET_BANKING", label: "Net Banking", icon: "🏦" },
                  { value: "WALLET", label: "Wallet", icon: "👛" }
                ].map((method) => (
                  <button
                    key={method.value}
                    type="button"
                    onClick={() => setPaymentMethod(method.value)}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      paymentMethod === method.value 
                        ? "border-violet-500 bg-violet-50" 
                        : "border-slate-200 hover:border-violet-300"
                    }`}
                  >
                    <div className="text-2xl mb-1">{method.icon}</div>
                    <div className="text-sm font-medium">{method.label}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setStep("select")} 
                className="flex-1 h-12 border-slate-200 text-slate-700 hover:bg-slate-50"
              >
                ← Back
              </Button>
              <Button 
                type="submit" 
                className="flex-1 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold" 
                disabled={loading}
              >
                {loading ? "Processing..." : `Pay ${formatMoney(totalAmount)}`}
              </Button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
}