"use client";

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Building2, Key } from 'lucide-react';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function OrganizationSelectionScreen() {
    const router = useRouter();
    const [showJoinModal, setShowJoinModal] = useState(false);
    const [inviteCode, setInviteCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleJoinWithCode = async () => {
        if (!inviteCode.trim()) {
            setError('Please enter an invite code');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const { assignRoleViaInviteAction } = await import('@/lib/actions/auth-basic.actions');
            const { auth } = await import('@/lib/firebase');

            const userId = auth.currentUser?.uid;
            if (!userId) {
                setError('Not authenticated');
                return;
            }

            const result = await assignRoleViaInviteAction({ userId, inviteCode: inviteCode.trim() });

            if (result.success) {
                // Reload to update auth context
                window.location.reload();
            } else {
                setError(result.error || 'Invalid invite code');
            }
        } catch (err: any) {
            setError(err.message || 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="min-h-screen flex items-center justify-center bg-[#F5F7FA] p-4">
                <div className="max-w-md w-full bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                    <div className="text-center mb-6">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Get started</h2>
                        <p className="text-sm text-gray-600">
                            Create your own school or join an existing one
                        </p>
                    </div>

                    <div className="space-y-3">
                        <Button
                            onClick={() => router.push('/create-school')}
                            className="w-full h-11 bg-gray-900 text-white hover:bg-gray-800 gap-2"
                        >
                            <Building2 className="h-4 w-4" />
                            Create a school
                        </Button>

                        <Button
                            onClick={() => setShowJoinModal(true)}
                            variant="outline"
                            className="w-full h-11 gap-2"
                        >
                            <Key className="h-4 w-4" />
                            Join with code
                        </Button>
                    </div>

                    <div className="mt-6 pt-6 border-t border-gray-200">
                        <p className="text-xs text-center text-gray-500">
                            You can also explore public content and games without joining a school
                        </p>
                    </div>
                </div>
            </div>

            <Dialog open={showJoinModal} onOpenChange={setShowJoinModal}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-semibold">Join with invite code</DialogTitle>
                        <DialogDescription className="text-sm text-gray-600">
                            Enter the code provided by your school administrator
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="invite-code" className="text-xs font-medium text-gray-700">
                                Invite Code
                            </Label>
                            <Input
                                id="invite-code"
                                value={inviteCode}
                                onChange={(e) => setInviteCode(e.target.value)}
                                placeholder="ABC123"
                                className="h-9 mt-1"
                            />
                        </div>

                        {error && (
                            <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
                                {error}
                            </div>
                        )}

                        <div className="flex gap-2">
                            <Button
                                onClick={() => setShowJoinModal(false)}
                                variant="outline"
                                className="flex-1 h-9"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleJoinWithCode}
                                disabled={loading}
                                className="flex-1 h-9 bg-gray-900 text-white"
                            >
                                {loading ? 'Joining...' : 'Join'}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
