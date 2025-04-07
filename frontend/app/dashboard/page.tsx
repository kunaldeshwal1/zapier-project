"use client"
import { Appbar } from "@/components/Appbar";
import { DarkButton } from "@/components/buttons/DarkButton";
import axios from "axios";
import { useEffect, useState } from "react";
import { BACKEND_URL, HOOKS_URL } from "../config";
import { LinkButton } from "@/components/buttons/LinkButton";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
interface Zap {
    "id": string,
    "triggerId": string,
    "userId": number,
    "actions": {
        "id": string,
        "zapId": string,
        "actionId": string,
        "sortingOrder": number,
        "type": {
            "id": string,
            "name": string
            "image": string
        }
    }[],
    "trigger": {
        "id": string,
        "zapId": string,
        "triggerId": string,
        "type": {
            "id": string,
            "name": string,
            "image": string
        }
    }
}

function useZaps() {
    const [loading, setLoading] = useState(true);
    const [zaps, setZaps] = useState<Zap[]>([]);
    
    const fetchZaps = async () => {
        try {
            const response = await axios.get(`${BACKEND_URL}/api/v1/zap`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                }
            });
            setZaps(response.data.zaps);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching zaps:", error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchZaps();
    }, []);

    return {
        loading,
        zaps,
        refreshZaps: fetchZaps
    };
}

export default function() {
    const { loading, zaps, refreshZaps } = useZaps();
    const router = useRouter();
    
    return (
        <ProtectedRoute>
        <div>
            <Appbar />
            <div className="flex justify-center pt-8">
                <div className="max-w-screen-lg	 w-full">
                    <div className="flex justify-between pr-8 ">
                        <div className="text-2xl font-bold">
                            My Zaps
                        </div>
                        <DarkButton onClick={() => {
                            router.push("/zap/create");
                        }}>Create</DarkButton>
                    </div>
                </div>
            </div>
            {loading ? "Loading..." : <div className="flex justify-center"> <ZapTable zaps={zaps} refreshZaps = {refreshZaps} /> </div>}
        </div>
        </ProtectedRoute>
    )
}

// In the ZapTable component, add an Edit button next to Go
function ZapTable({refreshZaps, zaps }: {refreshZaps:()=>Promise<void>,zaps: Zap[]}) {
    const router = useRouter();

    const handleDelete = async (zapId: string) => {
        try {
            await axios.delete(`${BACKEND_URL}/api/v1/zap/${zapId}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                }
            });
            // Refresh the page to show updated zaps
            await refreshZaps()
        } catch (error) {
            console.error("Error deleting zap:", error);
            alert("Failed to delete zap");
        }
    };

    return <div className="p-8 max-w-screen-lg w-full">
        <div className="flex">
                <div className="flex-1">Name</div>
                <div className="flex-1">ID</div>
                <div className="flex-1">Created at</div>
                <div className="flex-1">Webhook URL</div>
                <div className="flex-1">Actions</div>
        </div>
        {zaps.map(z => <div className="flex border-b border-t py-4" key={z.id}>
            <div className="flex-1 flex"><img src={z.trigger.type.image} className="w-[30px] h-[30px]" /> {z.actions.map(x => <img src={x.type.image} className="w-[30px] h-[30px]" key={x.id} />)}</div>
            <div className="flex-1">{z.id}</div>
            <div className="flex-1">Nov 13, 2023</div>
            <div className="flex-1">{`${HOOKS_URL}/hooks/catch/1/${z.id}`}</div>
            <div className="flex-1 flex gap-2">
                <LinkButton onClick={() => {
                    router.push("/zap/create?id=" + z.id)
                }}>Edit</LinkButton>
                <LinkButton onClick={() => {
                    if (confirm('Are you sure you want to delete this zap?')) {
                        handleDelete(z.id);
                    }
                }}>Delete</LinkButton>
            </div>
        </div>)}
    </div>
}