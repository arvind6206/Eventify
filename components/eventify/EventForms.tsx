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
        <form onSubmit={submit} className="grid gap-6 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label htmlFor="title" className="text-base font-semibold text-slate-800">Event name</Label>
            <Input
              required
              id="title"
              name="title"
              placeholder="The Midnight Garden"
              className="mt-3 h-12 border-slate-200 focus:border-violet-400 focus:ring-violet-100"
            />
          </div>
          <div>
            <Label htmlFor="category" className="text-base font-semibold text-slate-800">Category</Label>
            <Select name="category" defaultValue="CONCERT">
              <SelectTrigger className="mt-3 h-12 border-slate-200 focus:border-violet-400 focus:ring-violet-100">
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
            <Label htmlFor="status" className="text-base font-semibold text-slate-800">Status</Label>
            <Select name="status" defaultValue="DRAFT">
              <SelectTrigger className="mt-3 h-12 border-slate-200 focus:border-violet-400 focus:ring-violet-100">
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
            <Label htmlFor="venueId" className="text-base font-semibold text-slate-800">Venue</Label>
            <Select name="venueId" required>
              <SelectTrigger className="mt-3 h-12 border-slate-200 focus:border-violet-400 focus:ring-violet-100">
                <SelectValue placeholder="Select venue" />
              </SelectTrigger>
              <SelectContent>
                {venues.map((venue) => (
                  <SelectItem key={venue.id} value={venue.id}>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{venue.name}</span>
                      <span className="text-slate-500">·</span>
                      <span className="text-slate-600">{venue.city}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="startTime" className="text-base font-semibold text-slate-800">Starts</Label>
            <Input
              required
              id="startTime"
              name="startTime"
              type="datetime-local"
              className="mt-3 h-12 border-slate-200 focus:border-violet-400 focus:ring-violet-100"
            />
          </div>
          <div>
            <Label htmlFor="endTime" className="text-base font-semibold text-slate-800">Ends</Label>
            <Input
              required
              id="endTime"
              name="endTime"
              type="datetime-local"
              className="mt-3 h-12 border-slate-200 focus:border-violet-400 focus:ring-violet-100"
            />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="imageUrl" className="text-base font-semibold text-slate-800">Cover image URL (optional)</Label>
            <Input
              id="imageUrl"
              name="imageUrl"
              type="url"
              placeholder="https://…"
              className="mt-3 h-12 border-slate-200 focus:border-violet-400 focus:ring-violet-100"
            />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="description" className="text-base font-semibold text-slate-800">Description</Label>
            <Textarea
              id="description"
              name="description"
              rows={4}
              placeholder="What makes this event special?"
              className="mt-3 border-slate-200 focus:border-violet-400 focus:ring-violet-100"
            />
          </div>
          <Button type="submit" className="sm:col-span-2 h-12 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white font-semibold">
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
      <div className="mb-6 p-4 bg-violet-50 rounded-xl border border-violet-100">
        <p className="text-sm text-slate-600">
          Adding tickets to{" "}
          <span className="font-semibold text-violet-700">
            {event?.title ?? "this event"}
          </span>
        </p>
      </div>
      <form onSubmit={submit} className="grid gap-6 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Label htmlFor="name" className="text-base font-semibold text-slate-800">Ticket name</Label>
          <Input
            required
            id="name"
            name="name"
            placeholder="General admission"
            className="mt-3 h-12 border-slate-200 focus:border-violet-400 focus:ring-violet-100"
          />
        </div>
        <div>
          <Label htmlFor="price" className="text-base font-semibold text-slate-800">Price (₹)</Label>
          <Input
            required
            id="price"
            name="price"
            type="number"
            min="1"
            placeholder="999"
            className="mt-3 h-12 border-slate-200 focus:border-violet-400 focus:ring-violet-100"
          />
        </div>
        <div>
          <Label htmlFor="quantity" className="text-base font-semibold text-slate-800">Quantity</Label>
          <Input
            required
            id="quantity"
            name="quantity"
            type="number"
            min="0"
            placeholder="100"
            className="mt-3 h-12 border-slate-200 focus:border-violet-400 focus:ring-violet-100"
          />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="description" className="text-base font-semibold text-slate-800">Description (optional)</Label>
          <Textarea
            id="description"
            name="description"
            rows={4}
            placeholder="What does this ticket include?"
            className="mt-3 border-slate-200 focus:border-violet-400 focus:ring-violet-100"
          />
        </div>
        <Button type="submit" className="sm:col-span-2 h-12 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white font-semibold">
          Add ticket type
        </Button>
      </form>
    </Modal>
  );
}
