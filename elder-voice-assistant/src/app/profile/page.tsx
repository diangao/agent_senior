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
    <div className="min-h-screen bg-gradient-to-b from-green-100 to-white p-6 flex flex-col items-center">
      <div className="max-w-xl w-full">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 bg-white p-5 shadow-lg rounded-xl">
          <h1 className="text-2xl font-bold text-gray-800">Family Contacts</h1>
          <Button variant="outline" onClick={() => router.push("/")}>⬅ Back</Button>
        </div>

        {/* Add Contact Form */}
        <Card className="shadow-xl rounded-xl">
          <CardContent className="p-6 space-y-4">
            <Label>Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter name" />
            <Label>Relation</Label>
            <Input value={relation} onChange={(e) => setRelation(e.target.value)} placeholder="Father, Sister, etc." />
            <Label>Phone Number</Label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 234 567 890" />
            <div className="flex items-center gap-2">
              <Checkbox checked={isEmergencyContact} onCheckedChange={(checked) => setIsEmergencyContact(!!checked)} />
              <Label>Mark as Emergency Contact</Label>
            </div>
            <Button onClick={addFamilyMember} className="bg-green-600 text-white w-full">Add Family Member</Button>
          </CardContent>
        </Card>

        {/* List of Contacts */}
        <div className="mt-6 space-y-4">
          {familyMembers.length === 0 ? (
            <p className="text-center text-gray-500">No family members added yet.</p>
          ) : (
            familyMembers.map((member) => (
              <Card key={member.id} className="shadow-md rounded-xl">
                <CardContent className="p-4 flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-lg">{member.name}</p>
                    <p className="text-sm text-gray-600">{member.relation} • {member.phone}</p>
                    {member.isEmergencyContact && <p className="text-xs text-red-600 font-bold">Emergency Contact</p>}
                  </div>
                  <Button variant="destructive" onClick={() => setFamilyMembers(familyMembers.filter(m => m.id !== member.id))}>Delete</Button>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}