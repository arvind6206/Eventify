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
}



export function BookingFlow({ event, ticketTypes, close, submitReservation }: BookingFlowProps) {
  const [selectedTicketType, setSelectedTicketType] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);

  const selectedTicket = ticketTypes.find(t => t.id === selectedTicketType);
  const totalAmount = selectedTicket ? selectedTicket.price * quantity : 0;

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selectedTicketType) return;

    setLoading(true);
    try {
      await submitReservation({
        eventId: event.id,
        ticketTypeId: selectedTicketType,
        quantity,
      });
      close();
    } catch (error) {
      console.error("Reservation failed:", error);
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
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{event.title}</CardTitle>
            <CardDescription>{event.description || "Select your tickets below"}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 flex-wrap">
              <Badge variant="info">{event.category}</Badge>
              <Badge variant="secondary">{event.status}</Badge>
            </div>
          </CardContent>
        </Card>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="ticketType">Select ticket type</Label>
            <Select value={selectedTicketType} onValueChange={setSelectedTicketType}>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Choose a ticket type" />
              </SelectTrigger>
              <SelectContent>
                {ticketTypes.map((ticket) => (
                  <SelectItem key={ticket.id} value={ticket.id}>
                    <div className="flex justify-between w-full">
                      <span>{ticket.name}</span>
                      <span className="text-slate-500">{formatMoney(ticket.price)}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedTicket && (
            <Card>
              <CardContent className="pt-4">
                <p className="font-medium">{selectedTicket.name}</p>
                {selectedTicket.description && (
                  <p className="text-sm text-slate-500 mt-1">{selectedTicket.description}</p>
                )}
                <div className="flex justify-between items-center mt-3">
                  <span className="text-sm text-slate-500">Available: {selectedTicket.quantity}</span>
                  <span className="font-semibold">{formatMoney(selectedTicket.price)}</span>
                </div>
              </CardContent>
            </Card>
          )}

          <div>
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              max={selectedTicket?.quantity || 1}
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, Math.min(selectedTicket?.quantity || 1, parseInt(e.target.value) || 1)))}
              className="mt-2"
            />
          </div>

          {selectedTicket && (
            <Card>
              <CardContent className="pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Total amount</span>
                  <span className="text-2xl font-bold">{formatMoney(totalAmount)}</span>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={close} className="flex-1">
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="flex-1" 
              disabled={!selectedTicketType || loading}
            >
              {loading ? "Processing..." : "Reserve tickets"}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}