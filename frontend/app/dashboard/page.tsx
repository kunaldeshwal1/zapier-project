"use client";
import { Appbar } from "@/components/Appbar";
import axios from "axios";
import { useEffect, useState } from "react";
import { BACKEND_URL, HOOKS_URL } from "../config";
import { LinkButton } from "@/components/buttons/LinkButton";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import { SecondaryButton } from "@/components/buttons/SecondaryButton";
import { DeleteModal } from "@/components/buttons/DeleteModal";
interface Zap {
  id: string;
  triggerId: string;
  userId: number;
  actions: {
    id: string;
    zapId: string;
    actionId: string;
    sortingOrder: number;
    type: {
      id: string;
      name: string;
      image: string;
    };
  }[];
  trigger: {
    id: string;
    zapId: string;
    triggerId: string;
    type: {
      id: string;
      name: string;
      image: string;
    };
  };
}

function useZaps() {
  const [loading, setLoading] = useState(true);
  const [zaps, setZaps] = useState<Zap[]>([]);

  const fetchZaps = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/v1/zap`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
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
    refreshZaps: fetchZaps,
  };
}

export default function () {
  const { loading, zaps, refreshZaps } = useZaps();
  const router = useRouter();

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Appbar />
        {/* Header Section */}
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">My Zaps</h1>
                <p className="mt-2 text-sm text-gray-600">
                  Manage and monitor your automated workflows
                </p>
              </div>
              <SecondaryButton onClick={() => router.push("/zap/create")}>
                Create New Zap
              </SecondaryButton>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
              <p className="mt-4 text-gray-600">Loading your zaps...</p>
            </div>
          ) : zaps.length === 0 ? (
            <EmptyState onCreateClick={() => router.push("/zap/create")} />
          ) : (
            <ZapGrid zaps={zaps} refreshZaps={refreshZaps} />
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}

function EmptyState({ onCreateClick }: { onCreateClick: () => void }) {
  return (
    <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
      <svg
        className="mx-auto h-12 w-12 text-gray-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M13 10V3L4 14h7v7l9-11h-7z"
        />
      </svg>
      <h3 className="mt-2 text-sm font-semibold text-gray-900">No zaps yet</h3>
      <p className="mt-1 text-sm text-gray-500">
        Get started by creating your first automated workflow.
      </p>
      <div className="mt-6">
        <button
          onClick={onCreateClick}
          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Create your first Zap
        </button>
      </div>
    </div>
  );
}

function ZapGrid({
  refreshZaps,
  zaps,
}: {
  refreshZaps: () => Promise<void>;
  zaps: Zap[];
}) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    zapId: string | null;
    zapName: string;
  }>({
    isOpen: false,
    zapId: null,
    zapName: "",
  });

  const handleDeleteClick = (zap: Zap) => {
    const zapName = `${zap.trigger.type.name} → ${zap.actions
      .map((a) => a.type.name)
      .join(" → ")}`;
    setDeleteModal({
      isOpen: true,
      zapId: zap.id,
      zapName: zapName,
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.zapId) return;

    setDeletingId(deleteModal.zapId);
    try {
      await axios.delete(`${BACKEND_URL}/api/v1/zap/${deleteModal.zapId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      await refreshZaps();
      setDeleteModal({ isOpen: false, zapId: null, zapName: "" });
    } catch (error) {
      console.error("Error deleting zap:", error);
      // You could also show this error in the modal instead of alert
      alert("Failed to delete zap");
    } finally {
      setDeletingId(null);
    }
  };

  const copyWebhookUrl = (zapId: string) => {
    const url = `${HOOKS_URL}/hooks/catch/1/${zapId}`;
    navigator.clipboard.writeText(url);
    setCopiedId(zapId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <>
      <div className="grid gap-4 md:gap-6">
        {zaps.map((zap) => (
          <div
            key={zap.id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200"
          >
            <div className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Workflow Preview */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center">
                      <img
                        src={zap.trigger.type.image}
                        alt={zap.trigger.type.name}
                        className="w-8 h-8 rounded-full border-2 border-white bg-white shadow-sm"
                      />
                      {zap.actions.map((action, index) => (
                        <img
                          key={action.id}
                          src={action.type.image}
                          alt={action.type.name}
                          className="w-8 h-7 rounded-full border-2 border-white bg-white shadow-sm -ml-3 hover:-ml-1 duration-500"
                        />
                      ))}
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {zap.trigger.type.name} →{" "}
                    {zap.actions.map((a) => a.type.name).join(" → ")}
                  </h3>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-gray-600">
                    <span>Created Nov 13, 2023</span>
                    <span className="hidden sm:inline">•</span>
                    <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                      ID: {zap.id}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  {/* Webhook URL */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => copyWebhookUrl(zap.id)}
                      className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                      </svg>
                      {copiedId === zap.id ? "Copied!" : "Copy webhook"}
                    </button>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => router.push("/zap/create?id=" + zap.id)}
                      className="px-4 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteClick(zap)}
                      className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-500 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteModal
        isOpen={deleteModal.isOpen}
        onClose={() =>
          setDeleteModal({ isOpen: false, zapId: null, zapName: "" })
        }
        onConfirm={handleDeleteConfirm}
        zapName={deleteModal.zapName}
        isDeleting={deletingId === deleteModal.zapId}
      />
    </>
  );
}
