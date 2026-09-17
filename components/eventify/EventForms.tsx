import { FormEvent } from "react";
import { EventRecord, Venue } from "./types";
import { EmptyState, Field, inputClass, Modal, primaryButton } from "./ui";

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
            <Field label="Event name">
              <input
                required
                name="title"
                className={inputClass}
                placeholder="The Midnight Garden"
              />
            </Field>
          </div>
          <Field label="Category">
            <select
              name="category"
              defaultValue="CONCERT"
              className={inputClass}
            >
              {[
                "CONCERT",
                "SPORTS",
                "CONFERENCE",
                "COMEDY",
                "THEATRE",
                "WORKSHOP",
                "OTHER",
              ].map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </Field>
          <Field label="Status">
            <select name="status" defaultValue="DRAFT" className={inputClass}>
              {["DRAFT", "PUBLISHED", "CANCELLED", "COMPLETED"].map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </Field>
          <div className="sm:col-span-2">
            <Field label="Venue">
              <select required name="venueId" className={inputClass}>
                {venues.map((venue) => (
                  <option key={venue.id} value={venue.id}>
                    {venue.name} · {venue.city}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <Field label="Starts">
            <input
              required
              type="datetime-local"
              name="startTime"
              className={inputClass}
            />
          </Field>
          <Field label="Ends">
            <input
              required
              type="datetime-local"
              name="endTime"
              className={inputClass}
            />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Cover image URL (optional)">
              <input
                type="url"
                name="imageUrl"
                className={inputClass}
                placeholder="https://…"
              />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field label="Description">
              <textarea
                name="description"
                rows={3}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-3 text-sm outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
                placeholder="What makes this event special?"
              />
            </Field>
          </div>
          <button className={`sm:col-span-2 ${primaryButton}`}>
            Create event
          </button>
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
          <Field label="Ticket name">
            <input
              required
              name="name"
              className={inputClass}
              placeholder="General admission"
            />
          </Field>
        </div>
        <Field label="Price (₹)">
          <input
            required
            min="1"
            type="number"
            name="price"
            className={inputClass}
            placeholder="999"
          />
        </Field>
        <Field label="Quantity">
          <input
            required
            min="0"
            type="number"
            name="quantity"
            className={inputClass}
            placeholder="100"
          />
        </Field>
        <div className="sm:col-span-2">
          <Field label="Description (optional)">
            <textarea
              name="description"
              rows={3}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-3 text-sm outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
              placeholder="What does this ticket include?"
            />
          </Field>
        </div>
        <button className={`sm:col-span-2 ${primaryButton}`}>
          Add ticket type
        </button>
      </form>
    </Modal>
  );
}
