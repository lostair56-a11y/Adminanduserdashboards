import { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import { AddResidentDialog } from './AddResidentDialog';
import { EditResidentDialog } from './EditResidentDialog';

interface Resident {
  id: string;
  name: string;
  address: string;
  phone: string;
  joinDate: string;
}

export function ManageResidents() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingResident, setEditingResident] = useState<Resident | null>(null);

  // Empty initial state - data will be fetched from backend
  const [residents, setResidents] = useState<Resident[]>([]);

  const filteredResidents = residents.filter(
    (resident) =>
      resident.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resident.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus data warga ini?')) {
      setResidents(residents.filter((r) => r.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Data Warga Terdaftar</CardTitle>
              <CardDescription>Kelola data seluruh warga RT</CardDescription>
            </div>
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Tambah Warga
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Cari nama atau alamat..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama</TableHead>
                  <TableHead>Alamat</TableHead>
                  <TableHead>No. Telepon</TableHead>
                  <TableHead>Tanggal Bergabung</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredResidents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                      Tidak ada data warga ditemukan
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredResidents.map((resident) => (
                    <TableRow key={resident.id}>
                      <TableCell>{resident.name}</TableCell>
                      <TableCell>{resident.address}</TableCell>
                      <TableCell>{resident.phone}</TableCell>
                      <TableCell>
                        {new Date(resident.joinDate).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingResident(resident)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(resident.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <AddResidentDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onAdd={(resident) => {
          setResidents([...residents, { ...resident, id: Date.now().toString() }]);
          setShowAddDialog(false);
        }}
      />

      {editingResident && (
        <EditResidentDialog
          open={!!editingResident}
          onOpenChange={(open) => !open && setEditingResident(null)}
          resident={editingResident}
          onSave={(updated) => {
            setResidents(residents.map((r) => (r.id === updated.id ? updated : r)));
            setEditingResident(null);
          }}
        />
      )}
    </div>
  );
}