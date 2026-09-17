import { FormEvent } from "react";
import { EventRecord, Venue } from "./types";
import { EmptyState, Field, inputClass, Modal, primaryButton } from "./ui";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Textarea } from "../ui/textarea";

export function EventForm({
  venues,
  close,
  submit,
}: {
  venues: Venue[];
  close: () => void;
  submit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <Modal title="Create an event" close={close}>
      {venues.length === 0 ? (
        <EmptyState
          title="A venue is needed first"
          body="Ask an administrator to create a venue before you create an event."
        />
      ) : (
        <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label htmlFor="title">Event name</Label>
            <Input
              required
              id="title"
              name="title"
              placeholder="The Midnight Garden"
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="category">Category</Label>
            <Select name="category" defaultValue="CONCERT">
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {[
                  "CONCERT",
                  "SPORTS",
                  "CONFERENCE",
                  "COMEDY",
                  "THEATRE",
                  "WORKSHOP",
                  "OTHER",
                ].map((item) => (
                  <SelectItem key={item} value={item}>{item}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="status">Status</Label>
            <Select name="status" defaultValue="DRAFT">
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {["DRAFT", "PUBLISHED", "CANCELLED", "COMPLETED"].map((item) => (
                  <SelectItem key={item} value={item}>{item}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="venueId">Venue</Label>
            <Select name="venueId" required>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Select venue" />
              </SelectTrigger>
              <SelectContent>
                {venues.map((venue) => (
                  <SelectItem key={venue.id} value={venue.id}>
                    {venue.name} · {venue.city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="startTime">Starts</Label>
            <Input
              required
              id="startTime"
              name="startTime"
              type="datetime-local"
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="endTime">Ends</Label>
            <Input
              required
              id="endTime"
              name="endTime"
              type="datetime-local"
              className="mt-2"
            />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="imageUrl">Cover image URL (optional)</Label>
            <Input
              id="imageUrl"
              name="imageUrl"
              type="url"
              placeholder="https://…"
              className="mt-2"
            />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              rows={3}
              placeholder="What makes this event special?"
              className="mt-2"
            />
          </div>
          <Button type="submit" className="sm:col-span-2">
            Create event
          </Button>
        </form>
      )}
    </Modal>
  );
}

export function TicketForm({
  event,
  close,
  submit,
}: {
  event?: EventRecord;
  close: () => void;
  submit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <Modal title="Add a ticket type" close={close}>
      <p className="-mt-3 mb-6 text-sm text-slate-500">
        Adding tickets to{" "}
        <span className="font-medium text-slate-800">
          {event?.title ?? "this event"}
        </span>
      </p>
      <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Label htmlFor="name">Ticket name</Label>
          <Input
            required
            id="name"
            name="name"
            placeholder="General admission"
            className="mt-2"
          />
        </div>
        <div>
          <Label htmlFor="price">Price (₹)</Label>
          <Input
            required
            id="price"
            name="price"
            type="number"
            min="1"
            placeholder="999"
            className="mt-2"
          />
        </div>
        <div>
          <Label htmlFor="quantity">Quantity</Label>
          <Input
            required
            id="quantity"
            name="quantity"
            type="number"
            min="0"
            placeholder="100"
            className="mt-2"
          />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="description">Description (optional)</Label>
          <Textarea
            id="description"
            name="description"
            rows={3}
            placeholder="What does this ticket include?"
            className="mt-2"
          />
        </div>
        <Button type="submit" className="sm:col-span-2">
          Add ticket type
        </Button>
      </form>
    </Modal>
  );
}
