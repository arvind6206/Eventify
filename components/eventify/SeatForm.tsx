import { FormEvent } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Modal } from "./ui";

interface SeatFormProps {
  venueId: string;
  close: () => void;
  submit: (event: FormEvent<HTMLFormElement>) => void;
}

export function SeatForm({ venueId, close, submit }: SeatFormProps) {
  return (
    <Modal title="Add seat to venue" close={close}>
      <p className="-mt-3 mb-6 text-sm text-slate-500">
        Add a new seat to this venue. Only administrators can manage seats.
      </p>
      <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="row">Row</Label>
          <Input
            required
            id="row"
            name="row"
            placeholder="A"
            className="mt-2"
          />
        </div>
        <div>
          <Label htmlFor="number">Seat number</Label>
          <Input
            required
            id="number"
            name="number"
            type="number"
            min="1"
            placeholder="1"
            className="mt-2"
          />
        </div>
        <div>
          <Label htmlFor="section">Section (optional)</Label>
          <Input
            id="section"
            name="section"
            placeholder="Main"
            className="mt-2"
          />
        </div>
        <div>
          <Label htmlFor="type">Seat type</Label>
          <Select name="type" defaultValue="REGULAR">
            <SelectTrigger className="mt-2">
              <SelectValue placeholder="Select seat type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="REGULAR">Regular</SelectItem>
              <SelectItem value="PREMIUM">Premium</SelectItem>
              <SelectItem value="VIP">VIP</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="sm:col-span-2 flex gap-3 mt-2">
          <Button type="button" variant="outline" onClick={close} className="flex-1">
            Cancel
          </Button>
          <Button type="submit" className="flex-1">
            Add seat
          </Button>
        </div>
      </form>
    </Modal>
  );
}