import { FormEvent } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Modal } from "./ui";

interface VenueFormProps {
  close: () => void;
  submit: (event: FormEvent<HTMLFormElement>) => void;
}

export function VenueForm({ close, submit }: VenueFormProps) {
  return (
    <Modal title="Create a venue" close={close}>
      <p className="-mt-3 mb-6 text-sm text-slate-500">
        Add a new venue to the system. Only administrators can create venues.
      </p>
      <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Label htmlFor="name">Venue name</Label>
          <Input
            required
            id="name"
            name="name"
            placeholder="Madison Square Garden"
            className="mt-2"
          />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="description">Description (optional)</Label>
          <Textarea
            id="description"
            name="description"
            rows={3}
            placeholder="Describe the venue's facilities and ambiance..."
            className="mt-2"
          />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="address">Address</Label>
          <Input
            required
            id="address"
            name="address"
            placeholder="4 Pennsylvania Plaza"
            className="mt-2"
          />
        </div>
        <div>
          <Label htmlFor="city">City</Label>
          <Input
            required
            id="city"
            name="city"
            placeholder="New York"
            className="mt-2"
          />
        </div>
        <div>
          <Label htmlFor="state">State</Label>
          <Input
            required
            id="state"
            name="state"
            placeholder="NY"
            className="mt-2"
          />
        </div>
        <div>
          <Label htmlFor="country">Country</Label>
          <Input
            required
            id="country"
            name="country"
            placeholder="USA"
            className="mt-2"
          />
        </div>
        <div>
          <Label htmlFor="postalCode">Postal code</Label>
          <Input
            required
            id="postalCode"
            name="postalCode"
            placeholder="10001"
            className="mt-2"
          />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="capacity">Capacity</Label>
          <Input
            required
            id="capacity"
            name="capacity"
            type="number"
            min="1"
            placeholder="20000"
            className="mt-2"
          />
        </div>
        <div className="sm:col-span-2 flex gap-3 mt-2">
          <Button type="button" variant="outline" onClick={close} className="flex-1">
            Cancel
          </Button>
          <Button type="submit" className="flex-1">
            Create venue
          </Button>
        </div>
      </form>
    </Modal>
  );
}