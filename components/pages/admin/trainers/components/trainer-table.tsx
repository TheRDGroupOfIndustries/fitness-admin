"use client";

import { useState, useEffect, useCallback } from "react";
import { Edit2, Trash, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Trainer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  image?: string;
  specialization: string;
  rating: number | null;
  clients: Array<Trainer>;
  status: "ACTIVE" | "INACTIVE";
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
}

export function TrainerTable() {
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editTrainer, setEditTrainer] = useState<Trainer | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [trainerToDelete, setTrainerToDelete] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newTrainer, setNewTrainer] = useState({
    name: "",
    email: "",
    image: "",
    password: "",
    specialization: "",
  });

  const [paginationInfo, setPaginationInfo] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  const [trainersList, setTrainersList] = useState<
    { id: string; name: string; email: string }[]
  >([]);

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/users/userList");
      const data = await response.json();
      console.log("fetchUsers", data);

      if (response.status === 200) {
        setTrainersList(data)
      }
    } catch (error) {
      console.error("Error fetching trainers:", error);
    }
  };
  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const value = formData.get("adminFor");

    console.log(value);
    try {
      const res = await fetch("/api/users/userList", {
        method: "POST",
        body: JSON.stringify({
          id: value,
          selectedRole: "TRAINER",
          specialization: newTrainer.specialization,
          image: newTrainer.image,
        }),
      });
      if (res.status === 200) {
        window.location.reload();
      }
    } catch (error) {
      console.error("Error While prompting:", error);
      toast.error("An error occurred while creating the user.");
    }
  };

  async function uploadToCloudinary(file: any) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "my_unsigned_preset");

    const response = await fetch(
      "https://api.cloudinary.com/v1_1/dozknak00/image/upload",
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error("Failed to upload image");
    }

    const data = await response.json();
    return data.secure_url; // This is the URL of the uploaded image
  }

  const handleUpload = async (event: any) => {
    setIsLoading(true);
    const file = event.target.files[0];
    if (!file) return;

    try {
      const imageUrl = await uploadToCloudinary(file);
      isEditDialogOpen
        ? setEditTrainer({ ...editTrainer!, image: imageUrl })
        : setNewTrainer((prev: any) => ({ ...prev, image: imageUrl }));
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTrainers = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/trainers?page=${paginationInfo.currentPage}&limit=10&search=${searchTerm}`
      );
      if (response.ok) {
        const data = await response.json();
        setTrainers(data.trainers);
        setPaginationInfo({
          currentPage: data.currentPage,
          totalPages: data.totalPages,
          totalItems: data.totalItems,
        });
      } else {
        console.error("Failed to fetch trainers");
        toast.error("Failed to fetch trainers");
      }
    } catch (error) {
      console.error("Error fetching trainers:", error);
      toast.error("An error occurred while fetching trainers");
    } finally {
      setIsLoading(false);
    }
  }, [paginationInfo.currentPage, searchTerm]);

  useEffect(() => {
    fetchTrainers();
  }, [fetchTrainers]);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPaginationInfo((prev) => ({ ...prev, currentPage: 1 }));
  };

  const handlePageChange = (newPage: number) => {
    setPaginationInfo((prev) => ({ ...prev, currentPage: newPage }));
  };

  const handleEdit = (trainer: Trainer) => {
    setEditTrainer(trainer);
    setIsEditDialogOpen(true);
  };

  const handleUpdate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editTrainer) return;

    try {
      const response = await fetch(`/api/trainers/${editTrainer.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editTrainer),
      });

      if (response.ok) {
        setIsEditDialogOpen(false);
        fetchTrainers();
        toast.success("Trainer updated successfully");
        window.location.reload();
      } else {
        console.error("Failed to update trainer");
        toast.error("Failed to update trainer");
      }
    } catch (error) {
      console.error("Error updating trainer:", error);
      toast.error("An error occurred while updating the trainer");
    }
  };

  const handleDelete = (trainerId: string) => {
    setTrainerToDelete(trainerId);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!trainerToDelete) return;

    try {
      const response = await fetch(`/api/trainers/${trainerToDelete}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setIsDeleteDialogOpen(false);
        fetchTrainers();
        toast.success("Trainer deleted successfully");
        window.location.reload();
      } else {
        console.error("Failed to delete trainer");
        toast.error("Failed to delete trainer");
      }
    } catch (error) {
      console.error("Error deleting trainer:", error);
      toast.error("An error occurred while deleting the trainer");
    }
  };

  const handleAddTrainer = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newTrainer),
      });

      if (response.ok) {
        setIsAddDialogOpen(false);
        fetchTrainers();
        setNewTrainer({
          name: "",
          email: "",
          password: "",
          specialization: "",
          image: "",
        });
        toast.success("Trainer added successfully");
        window.location.reload();
      } else {
        console.error("Failed to add trainer");
        toast.error("Failed to add trainer");
      }
    } catch (error) {
      console.error("Error adding trainer:", error);
      toast.error("An error occurred while adding the trainer");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-semibold">Trainer Management</h2>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Input
            placeholder="Search trainers..."
            className="max-w-xs"
            value={searchTerm}
            onChange={handleSearch}
          />
          <Button
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() => setIsAddDialogOpen(true)}
          >
            Add Trainer
          </Button>
        </div>
      </div>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Trainer</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Specialization</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Clients</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : trainers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  No trainers found
                </TableCell>
              </TableRow>
            ) : (
              trainers.map((trainer) => (
                <TableRow key={trainer.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Image
                        src={trainer.image ? trainer.image : "/pfp.jpg"}
                        alt="profile"
                        width={40}
                        height={40}
                        className="rounded-full bg-gray-100"
                      />
                      <div>
                        <div className="font-medium">{trainer.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {trainer.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{trainer.phone ? trainer.phone : "N/A"}</TableCell>
                  <TableCell>{trainer.specialization}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <span className="text-yellow-500">★</span>
                      {(trainer.rating ?? 0).toFixed(1)}
                    </div>
                  </TableCell>
                  <TableCell>{trainer.clients?.length}</TableCell>
                  <TableCell>
                    <div
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                        trainer.status === "ACTIVE"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {trainer.status}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(trainer)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(trainer.id)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-700">
          Showing {(paginationInfo.currentPage - 1) * 10 + 1} to{" "}
          {Math.min(paginationInfo.currentPage * 10, paginationInfo.totalItems)}{" "}
          of {paginationInfo.totalItems} trainers
        </p>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(paginationInfo.currentPage - 1)}
            disabled={paginationInfo.currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(paginationInfo.currentPage + 1)}
            disabled={paginationInfo.currentPage === paginationInfo.totalPages}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Edit Trainer Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Trainer</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdate}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  value={editTrainer?.name || ""}
                  onChange={(e) =>
                    setEditTrainer({ ...editTrainer!, name: e.target.value })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  Email
                </Label>
                <Input
                  id="email"
                  value={editTrainer?.email || ""}
                  onChange={(e) =>
                    setEditTrainer({ ...editTrainer!, email: e.target.value })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-image" className="text-right">
                  Image
                </Label>
                <div className="col-span-3 flex flex-col gap-3">
                  {editTrainer?.image ? (
                    <div className="relative h-40 w-40 group">  
                      <Image
                        src={editTrainer.image}
                        alt="Trainer image"
                        fill
                        className="rounded-xl object-cover border border-gray-200"
                      />
                      {/* Overlay buttons for Edit/Remove */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 rounded-xl">
                        <label
                          htmlFor="edit-image-upload"
                          className="cursor-pointer p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
                          title="Change Image"
                        >
                          <Edit2 className="h-4 w-4 text-gray-700" />
                          <input
                            id="edit-image-upload"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleUpload}
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => setEditTrainer({ ...editTrainer!, image: "" })}
                          className="p-2 bg-white rounded-full hover:bg-red-50 transition-colors"
                          title="Remove Image"
                        >
                          <Trash className="h-4 w-4 text-red-600" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Input
                        id="edit-image"
                        type="file"
                        accept="image/*"
                        onChange={handleUpload}
                        className="flex-1"
                      />
                      {isLoading && <span className="text-xs text-muted-foreground">Uploading...</span>}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="specialization" className="text-right">
                  Specialization
                </Label>
                <Input
                  id="specialization"
                  value={editTrainer?.specialization || ""}
                  onChange={(e) =>
                    setEditTrainer({
                      ...editTrainer!,
                      specialization: e.target.value,
                    })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="text-right">
                  Status
                </Label>
                <select
                  id="status"
                  value={editTrainer?.status || ""}
                  onChange={(e) =>
                    setEditTrainer({
                      ...editTrainer!,
                      status: e.target.value as "ACTIVE" | "INACTIVE",
                    })
                  }
                  className="col-span-3 border bg-white py-2 px-3 rounded"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isLoading ? true : false}>
                Save changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete this trainer?</p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Trainer Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Trainer</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="adminFor">Assigned New Trainer</Label>
                <Select name="adminFor">
                  <SelectTrigger id="adminFor">
                    <SelectValue placeholder="Select a User or Trainer" />
                  </SelectTrigger>
                  <SelectContent>
                    {trainersList.map((trainer) => (
                      <SelectItem key={trainer.id} value={trainer.id}>
                        {trainer.name} {`(${trainer.email})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="new-email" className="text-right">
                  Image
                </Label>
                {newTrainer.image ? (
                  <Image
                    src={newTrainer.image}
                    alt={"Trainer image"}
                    width={600}
                    height={600}
                    className="rounded-xl"
                  />
                ) : (
                  <Input
                    id="new-image"
                    type="file"
                    accept="image/*"
                    // value={newTrainer.image}
                    onChange={handleUpload}
                    className="col-span-3"
                  />
                )}
              </div>
              {/* <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="new-password" className="text-right">
                  Password
                </Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newTrainer.password}
                  onChange={(e) => setNewTrainer({ ...newTrainer, password: e.target.value })}
                  className="col-span-3"
                />
              </div> */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="new-specialization" className="text-right">
                  Specialization
                </Label>
                <Input
                  id="new-specialization"
                  value={newTrainer.specialization}
                  onChange={(e) =>
                    setNewTrainer({
                      ...newTrainer,
                      specialization: e.target.value,
                    })
                  }
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isLoading ? true : false}>
                Add Trainer
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
