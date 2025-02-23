"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

interface FamilyMember {
  id: string;
  name: string;
  relation: string;
  phone: string;
  isEmergencyContact: boolean;
}

export default function ProfilePage() {
  const router = useRouter();
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [name, setName] = useState("");
  const [relation, setRelation] = useState("");
  const [phone, setPhone] = useState("");
  const [isEmergencyContact, setIsEmergencyContact] = useState(false);
  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null);

  // Load family members from localStorage when the page loads
  useEffect(() => {
    const storedMembers = localStorage.getItem("familyMembers");
    if (storedMembers) {
      setFamilyMembers(JSON.parse(storedMembers));
    }
  }, []);

  // Save family members to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("familyMembers", JSON.stringify(familyMembers));
  }, [familyMembers]);

  const addFamilyMember = () => {
    if (!name || !relation || !phone) return alert("Please fill out all fields.");

    const newMember: FamilyMember = {
      id: `${Date.now()}`,
      name,
      relation,
      phone,
      isEmergencyContact,
    };

    setFamilyMembers([...familyMembers, newMember]);
    resetForm();
  };

  const deleteFamilyMember = (id: string) => {
    const updatedMembers = familyMembers.filter((member) => member.id !== id);
    setFamilyMembers(updatedMembers);
  };

  const editFamilyMember = (member: FamilyMember) => {
    setEditingMember(member);
  };

  const updateFamilyMember = () => {
    if (!editingMember) return;

    const updatedMembers = familyMembers.map((member) =>
      member.id === editingMember.id ? editingMember : member
    );
    setFamilyMembers(updatedMembers);
    setEditingMember(null);
  };

  const resetForm = () => {
    setName("");
    setRelation("");
    setPhone("");
    setIsEmergencyContact(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Family Contacts</h1>
          <Button variant="outline" onClick={() => router.push("/")}>⬅ Back</Button>
        </div>

        {/* Add New Family Member Form */}
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div>
                <Label>Name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter name" />
              </div>
              <div>
                <Label>Relation</Label>
                <Input value={relation} onChange={(e) => setRelation(e.target.value)} placeholder="e.g., Father, Sister" />
              </div>
              <div>
                <Label>Phone Number</Label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="e.g., +1 234 567 890" />
              </div>
              <div className="flex items-center gap-2">
                <Checkbox checked={isEmergencyContact} onCheckedChange={(checked) => setIsEmergencyContact(!!checked)} />
                <Label>Mark as Emergency Contact</Label>
              </div>
              <Button onClick={addFamilyMember} className="w-full">Add Family Member</Button>
            </div>
          </CardContent>
        </Card>

        {/* List of Family Members */}
        <div className="mt-6 space-y-4">
          {familyMembers.length === 0 ? (
            <p className="text-center text-gray-500">No family members added yet.</p>
          ) : (
            familyMembers.map((member) => (
              <Card key={member.id}>
                <CardContent className="p-4 flex justify-between items-center">
                  <div>
                    <p className="font-semibold">{member.name}</p>
                    <p className="text-sm text-gray-500">{member.relation} • {member.phone}</p>
                    {member.isEmergencyContact && <p className="text-xs text-red-600 font-bold">Emergency Contact</p>}
                  </div>
                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="secondary" onClick={() => editFamilyMember(member)}>Edit</Button>
                      </DialogTrigger>
                      {editingMember && editingMember.id === member.id && (
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Edit Family Member</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label>Name</Label>
                              <Input
                                value={editingMember.name}
                                onChange={(e) =>
                                  setEditingMember({ ...editingMember, name: e.target.value })
                                }
                              />
                            </div>
                            <div>
                              <Label>Relation</Label>
                              <Input
                                value={editingMember.relation}
                                onChange={(e) =>
                                  setEditingMember({ ...editingMember, relation: e.target.value })
                                }
                              />
                            </div>
                            <div>
                              <Label>Phone Number</Label>
                              <Input
                                value={editingMember.phone}
                                onChange={(e) =>
                                  setEditingMember({ ...editingMember, phone: e.target.value })
                                }
                              />
                            </div>
                            <div className="flex items-center gap-2">
                              <Checkbox
                                checked={editingMember.isEmergencyContact}
                                onCheckedChange={(checked) =>
                                  setEditingMember({ ...editingMember, isEmergencyContact: !!checked })
                                }
                              />
                              <Label>Emergency Contact</Label>
                            </div>
                          </div>
                          <DialogFooter>
                            <Button onClick={updateFamilyMember}>Save Changes</Button>
                          </DialogFooter>
                        </DialogContent>
                      )}
                    </Dialog>
                    <Button variant="destructive" onClick={() => deleteFamilyMember(member.id)}>Delete</Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
