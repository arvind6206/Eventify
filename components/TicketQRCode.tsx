"use client";

import { QRCodeCanvas } from "qrcode.react";

interface TicketQRCodeProps {
    ticketCode: string
}

export default function TicketQRCode({
    ticketCode
}: TicketQRCodeProps) {
    return (
        <div className='flex flex-col items-center gap-3'>
            <QRCodeCanvas
                value={ticketCode}
                size={200}
                level="H"
            />

            <p className='text-sm text-gray-500'>
                {ticketCode}
            </p>
        </div>
    )
}