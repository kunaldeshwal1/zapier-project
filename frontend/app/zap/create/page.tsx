"use client";

import { BACKEND_URL } from "@/app/config";
import { Appbar } from "@/components/Appbar";
import { Input } from "@/components/Input";
import { PrimaryButton } from "@/components/buttons/PrimaryButton";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import  { 
    ReactFlow,
    Background, 
    Controls,
    Node,
    Edge,
    addEdge,
    applyNodeChanges,
    applyEdgeChanges
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

function useAvailableActionsAndTriggers() {
    const [availableActions, setAvailableActions] = useState([]);
    const [availableTriggers, setAvailableTriggers] = useState([]);

    useEffect(() => {
        axios.get(`${BACKEND_URL}/api/v1/trigger/available`)
    .then(x => {
        setAvailableTriggers(x.data.availableTrigger);
    })
    .catch(err => {
        console.error("Error fetching triggers:", err);
    });

        axios.get(`${BACKEND_URL}/api/v1/action/available`)
            .then(x => {
                setAvailableActions(x.data.availableActions)
            })
    }, [])
    return {
        availableActions,
        availableTriggers
    }
}

export default function() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const { availableActions, availableTriggers } = useAvailableActionsAndTriggers();
    const [selectedTrigger, setSelectedTrigger] = useState<{
        id: string;
        name: string;
    }>();

    const [selectedActions, setSelectedActions] = useState<{
        index: number;
        availableActionId: string;
        availableActionName: string;
        metadata: any;
    }[]>([]);
    const [selectedModalIndex, setSelectedModalIndex] = useState<null | number>(null);

    // New ReactFlow states
    const [nodes, setNodes] = useState<Node[]>([
        {
            id: '1',
            data: { label: selectedTrigger?.name || 'Trigger' },
            position: { x: 250, y: 50 },
            type: 'input'
        }
    ]);
    const [edges, setEdges] = useState<Edge[]>([]);

    // Update nodes when actions change
    // Add this new useEffect after your existing state declarations
    useEffect(() => {
        setNodes(nodes => [
            {
                id: '1',
                data: { label: selectedTrigger?.name || 'Trigger' },
                position: { x: 250, y: 50 },
                type: 'input'
            },
            ...nodes.slice(1)
        ]);
    }, [selectedTrigger]);
    
    // Modify your existing actions useEffect
    useEffect(() => {
        const actionNodes = selectedActions.map((action, idx) => ({
            id: `${action.index}`,
            data: { label: action.availableActionName || 'Action' },
            position: { x: 250, y: (idx + 1) * 100 + 50 },
        }));
    
        setNodes(nodes => [nodes[0], ...actionNodes]); // Keep the trigger node
    
        const newEdges = selectedActions.map((_, idx) => ({
            id: `e${idx}`,
            source: idx === 0 ? '1' : `${idx + 1}`,
            target: `${idx + 2}`,
        }));
        setEdges(newEdges);
    }, [selectedActions]);

    // ReactFlow handlers
    const onNodesChange = useCallback(
        (changes: any) => setNodes((nds) => applyNodeChanges(changes, nds)),
        []
    );

    const onEdgesChange = useCallback(
        (changes: any) => setEdges((eds) => applyEdgeChanges(changes, eds)),
        []
    );

    const onConnect = useCallback(
        (params: any) => setEdges((eds) => addEdge(params, eds)),
        []
    );

    const onNodeClick = useCallback((event: any, node: Node) => {
        const nodeIndex = parseInt(node.id);
        setSelectedModalIndex(nodeIndex);
    }, []);

    // Add effect to fetch existing zap and flow data
    // Modify the existing useEffect
    useEffect(() => {
        const searchParams = new URLSearchParams(window.location.search);
        const zapId = searchParams.get('id');
        
        if (zapId) {
            axios.get(`${BACKEND_URL}/api/v1/zap/${zapId}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                }
            })
            .then(response => {
                const zap = response.data.zap;
                
                // Set trigger
                if (zap.trigger) {
                    setSelectedTrigger({
                        id: zap.trigger.triggerId,
                        name: zap.trigger.type.name
                    });
                }

                // Set actions
                if (zap.actions) {
                    setSelectedActions(zap.actions.map((action: any, idx: number) => ({
                        index: idx + 2,
                        availableActionId: action.actionId,
                        availableActionName: action.type.name,
                        metadata: action.metadata
                    })));
                }

                // Set flow data if it exists
                if (zap.flow) {
                    setNodes(zap.flow.node);
                    setEdges(zap.flow.edge);
                }
            })
            .finally(() => {
                setIsLoading(false);
            });
        } else {
            setIsLoading(false); // Also set loading to false if there's no zapId
        }
    }, []);

    if (isLoading) {
        return <div>Loading...</div>;
    }

    return <div>
        <Appbar />
        <div className="flex justify-end bg-slate-200 p-4">
            <PrimaryButton onClick={async () => {
                if (!selectedTrigger?.id) {
                    return;
                }

                const response = await axios.post(`${BACKEND_URL}/api/v1/zap`, {
                    "availableTriggerId": selectedTrigger.id,
                    "triggerMetadata": {},
                    "actions": selectedActions.map(a => ({
                        availableActionId: a.availableActionId,
                        actionMetadata: a.metadata
                    })),
                    flow:{
                        node:nodes,
                        edge:edges // Assuming edges are the edges you want to save in the Zap meth
                    }
                }, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`
                    }
                });
                
                router.push("/dashboard");
            }}>Publish</PrimaryButton>
        </div>
        <div style={{ height: '80vh' }} className="bg-slate-200">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onNodeClick={onNodeClick}
                fitView
            >
                <Background />
                <Controls />
            </ReactFlow>
            <div className="flex justify-center p-4 absolute left-0 top-16">
                <PrimaryButton onClick={() => {
                    setSelectedActions(a => [...a, {
                        index: a.length + 2,
                        availableActionId: "",
                        availableActionName: "",
                        metadata: {}
                    }])
                }}>
                    <div className="text-2xl">+</div>
                </PrimaryButton>
            </div>
        </div>
        {selectedModalIndex && <Modal 
            availableItems={selectedModalIndex === 1 ? availableTriggers : availableActions} 
            onSelect={(props: null | { name: string; id: string; metadata: any; }) => {
            if (props === null) {
                setSelectedModalIndex(null);
                return;
            }
            if (selectedModalIndex === 1) {
                setSelectedTrigger({
                    id: props.id,
                    name: props.name
                })
            } else {
                setSelectedActions(a => {
                    let newActions = [...a];
                    newActions[selectedModalIndex - 2] = {
                        index: selectedModalIndex,
                        availableActionId: props.id,
                        availableActionName: props.name,
                        metadata: props.metadata
                    }
                    return newActions
                })
            }
            setSelectedModalIndex(null);
        }} index={selectedModalIndex} />}
    </div>
}

function Modal({ index, onSelect, availableItems }: { index: number, onSelect: (props: null | { name: string; id: string; metadata: any; }) => void, availableItems: {id: string, name: string, image: string;}[] }) {
    const [step, setStep] = useState(0);
    const [selectedAction, setSelectedAction] = useState<{
        id: string;
        name: string;
    }>();
    const isTrigger = index === 1;

    return <div className="fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full bg-slate-100 bg-opacity-70 flex">
        <div className="relative p-4 w-full max-w-2xl max-h-full">
            <div className="relative bg-white rounded-lg shadow ">
                <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t ">
                    <div className="text-xl">
                        Select {index === 1 ? "Trigger" : "Action"}
                    </div>
                    <button onClick={() => {
                        onSelect(null);
                    }} type="button" className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center" data-modal-hide="default-modal">
                        <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                        </svg>
                        <span className="sr-only">Close modal</span>
                    </button>
                </div>
                <div className="p-4 md:p-5 space-y-4">
                    {step === 1 && selectedAction?.id === "email" && <EmailSelector setMetadata={(metadata) => {
                        onSelect({
                            ...selectedAction,
                            metadata
                        })
                    }} />}

                    {(step === 1 && selectedAction?.id === "send-sol") && <SolanaSelector setMetadata={(metadata) => {
                        onSelect({
                            ...selectedAction,
                            metadata
                        })
                    }} />}

                    {step === 0 && <div>{availableItems.map(({id, name, image}) => {
                            return <div onClick={() => {
                                if (isTrigger) {
                                    onSelect({
                                        id,
                                        name,
                                        metadata: {}
                                    })
                                } else {
                                    setStep(s => s + 1);
                                    setSelectedAction({
                                        id,
                                        name
                                    })
                                }
                            }} className="flex border p-4 cursor-pointer hover:bg-slate-100">
                                <img src={image} width={30} className="rounded-full" /> <div className="flex flex-col justify-center"> {name} </div>
                            </div>
                        })}</div>}                    
                </div>
            </div>
        </div>
    </div>

}

function EmailSelector({setMetadata}: {
    setMetadata: (params: any) => void;
}) {
    const [email, setEmail] = useState("");
    const [body, setBody] = useState("");

    return <div>
        <Input label={"To"} type={"text"} placeholder="To" onChange={(e) => setEmail(e.target.value)}></Input>
        <Input label={"Body"} type={"text"} placeholder="Body" onChange={(e) => setBody(e.target.value)}></Input>
        <div className="pt-2">
            <PrimaryButton onClick={() => {
                setMetadata({
                    email,
                    body
                })
            }}>Submit</PrimaryButton>
        </div>
    </div>
}

function SolanaSelector({setMetadata}: {
    setMetadata: (params: any) => void;
}) {
    const [amount, setAmount] = useState("");
    const [address, setAddress] = useState("");    

    return <div>
        <Input label={"To"} type={"text"} placeholder="To" onChange={(e) => setAddress(e.target.value)}></Input>
        <Input label={"Amount"} type={"text"} placeholder="To" onChange={(e) => setAmount(e.target.value)}></Input>
        <div className="pt-4">
        <PrimaryButton onClick={() => {
            setMetadata({
                amount,
                address
            })
        }}>Submit</PrimaryButton>
        </div>
    </div>
}