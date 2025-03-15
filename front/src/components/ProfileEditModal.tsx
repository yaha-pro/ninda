import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { updateProfile } from "@/lib/axios";
import { useAuth } from "@/contexts/AuthContext";
import toast from "react-hot-toast";

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProfileEditModal({ isOpen, onClose }: ProfileEditModalProps) {
  const { user, setUser } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      setName(user.name || "");
      setBio(user.bio || "");
    }
  }, [isOpen, user]);

  const handleUpdateProfile = async () => {
    if (!name.trim()) {
      toast.error("表示名を入力してください");
      return;
    }

    try {
      setIsLoading(true);
      await updateProfile({ name, bio });
      setUser((prev) => (prev ? { ...prev, name, bio } : null));
      toast.success("プロフィールを更新しました");
      onClose();
    } catch {
      toast.error("プロフィールの更新に失敗しました");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[390px] h-auto">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold">
            プロフィール編集
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="space-y-1">
            <label className="text-sm font-medium">表示名</label>
            <Input
              type="text"
              placeholder="表示名"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">紹介文</label>
            <textarea
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="自己紹介"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
            />
          </div>
          <div className="flex justify-center">
            <Button
              className="w-52 bg-[#FF8D76] text-white hover:bg-red-500"
              onClick={handleUpdateProfile}
              disabled={isLoading}
            >
              {isLoading ? "更新中..." : "更新する"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
