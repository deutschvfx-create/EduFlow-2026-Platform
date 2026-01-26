
import QRCode from "react-qr-code";
import { Card } from "@/components/ui/card";

export function InviteQR({ value }: { value: string }) {
    return (
        <div className="bg-white p-4 rounded-lg w-fit mx-auto">
            <QRCode value={value} size={200} />
        </div>
    )
}
