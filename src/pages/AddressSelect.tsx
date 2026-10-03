import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { MapPin, Plus, Home, Briefcase, MoreHorizontal, Check, Trash2, Edit2, ArrowLeft } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchAddresses,
  createAddress,
  updateAddressAsync,
  deleteAddressAsync,
  selectAddress,
  selectAddresses,
  selectSelectedAddressId,
  selectAddressLoading,
  Address
} from '@/store/slices/addressSlice';
import { useToast } from '@/hooks/use-toast';

type FormFields = 'name' | 'phone' | 'addressLine1' | 'addressLine2' | 'city' | 'state' | 'pincode';

interface OutlinedFieldProps {
  id: string;
  label: string;
  value: string;
  required?: boolean;
  error?: string;
  placeholder?: string;
  onChange: (value: string) => void;
}

const OutlinedField: React.FC<OutlinedFieldProps> = ({ id, label, value, required, error, placeholder, onChange }) => (
  <div>
    <div className="relative">
      <label
        htmlFor={id}
        className="absolute -top-2 left-3 z-10 bg-card px-1 text-xs text-muted-foreground"
      >
        {label}
        {required && '*'}
      </label>
      <input
        id={id}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full rounded-lg border bg-transparent px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 ${
          error ? 'border-destructive' : 'border-input'
        }`}
      />
    </div>
    {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
  </div>
);

const typeOptions: { value: 'home' | 'work' | 'other'; label: string; icon: React.ReactNode }[] = [
  { value: 'home', label: 'Home', icon: <Home className="w-4 h-4" /> },
  { value: 'work', label: 'Work', icon: <Briefcase className="w-4 h-4" /> },
  { value: 'other', label: 'Other', icon: <MoreHorizontal className="w-4 h-4" /> },
];

const AddressSelect: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const addresses = useAppSelector(selectAddresses);
  const selectedAddressId = useAppSelector(selectSelectedAddressId);
  const isLoading = useAppSelector(selectAddressLoading);

  useEffect(() => {
    dispatch(fetchAddresses());
  }, [dispatch]);

  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Partial<Record<FormFields, string>>>({});
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
    type: 'home' as 'home' | 'work' | 'other',
    isDefault: false,
  });

  const updateField = (field: FormFields, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      phone: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      pincode: '',
      type: 'home',
      isDefault: false,
    });
    setErrors({});
    setEditingAddress(null);
  };

  const handleOpenForm = (address?: Address) => {
    if (address) {
      setEditingAddress(address);
      setFormData({
        name: address.name,
        phone: address.phone,
        addressLine1: address.addressLine1,
        addressLine2: address.addressLine2 || '',
        city: address.city,
        state: address.state,
        pincode: address.pincode,
        type: address.type,
        isDefault: address.isDefault,
      });
      setErrors({});
    } else {
      resetForm();
    }
    setShowForm(true);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    resetForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const nextErrors: Partial<Record<FormFields, string>> = {};
    if (!formData.name) nextErrors.name = 'Please provide your full name.';
    if (!formData.phone) nextErrors.phone = 'Please provide a phone number.';
    if (!formData.pincode) nextErrors.pincode = 'Please provide the pincode.';
    if (!formData.state) nextErrors.state = 'Please provide the state.';
    if (!formData.city) nextErrors.city = 'Please provide the city.';
    if (!formData.addressLine1) nextErrors.addressLine1 = 'Please provide the necessary details.';

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingAddress) {
        const result = await dispatch(updateAddressAsync({ ...formData, id: editingAddress.id }));
        if (updateAddressAsync.fulfilled.match(result)) {
          toast({ title: "Address updated successfully" });
        } else {
          toast({ title: "Could not update address", description: result.payload as string, variant: "destructive" });
          return;
        }
      } else {
        // First address becomes the default automatically, matching prior UX.
        const payload = { ...formData, isDefault: formData.isDefault || addresses.length === 0 };
        const result = await dispatch(createAddress(payload));
        if (createAddress.fulfilled.match(result)) {
          toast({ title: "Address added successfully" });
        } else {
          toast({ title: "Could not add address", description: result.payload as string, variant: "destructive" });
          return;
        }
      }

      setShowForm(false);
      resetForm();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    const result = await dispatch(deleteAddressAsync(deleteId));
    if (deleteAddressAsync.fulfilled.match(result)) {
      toast({ title: "Address removed" });
    } else {
      toast({ title: "Could not remove address", description: result.payload as string, variant: "destructive" });
    }
    setDeleteId(null);
  };

  const handleSelect = (id: string) => {
    dispatch(selectAddress(id));
  };

  const handleContinue = () => {
    if (!selectedAddressId) {
      toast({
        title: "Select an address",
        description: "Please select a delivery address to continue",
        variant: "destructive",
      });
      return;
    }
    navigate('/checkout/review');
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'home': return <Home className="w-4 h-4" />;
      case 'work': return <Briefcase className="w-4 h-4" />;
      default: return <MoreHorizontal className="w-4 h-4" />;
    }
  };

  return (
    <>
      <Helmet>
        <title>Select Address - Brundhavanam Desi Foods</title>
        <meta name="description" content="Select your delivery address for your order" />
      </Helmet>

      <Navbar />

      <main className="min-h-screen bg-muted/30 py-8">
        <div className="container max-w-3xl mx-auto px-4">
          {/* Progress Steps */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">1</div>
              <span className="text-sm font-medium">Address</span>
            </div>
            <div className="w-12 h-0.5 bg-border" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-sm font-medium">2</div>
              <span className="text-sm text-muted-foreground">Review & Pay</span>
            </div>
          </div>

          {showForm ? (
            <>
              <button
                type="button"
                onClick={handleCancelForm}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to addresses
              </button>

              <h1 className="text-2xl font-bold mb-6">{editingAddress ? 'Edit Address' : 'Add New Address'}</h1>

              <Card>
                <CardContent className="p-6">
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <OutlinedField
                      id="name"
                      label="Full Name"
                      required
                      value={formData.name}
                      error={errors.name}
                      onChange={(v) => updateField('name', v)}
                    />

                    <OutlinedField
                      id="phone"
                      label="Phone number"
                      required
                      value={formData.phone}
                      error={errors.phone}
                      onChange={(v) => updateField('phone', v)}
                    />

                    <OutlinedField
                      id="pincode"
                      label="Pincode"
                      required
                      value={formData.pincode}
                      error={errors.pincode}
                      onChange={(v) => updateField('pincode', v)}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <OutlinedField
                        id="state"
                        label="State"
                        required
                        value={formData.state}
                        error={errors.state}
                        onChange={(v) => updateField('state', v)}
                      />
                      <OutlinedField
                        id="city"
                        label="City"
                        required
                        value={formData.city}
                        error={errors.city}
                        onChange={(v) => updateField('city', v)}
                      />
                    </div>

                    <OutlinedField
                      id="addressLine1"
                      label="House No., Building Name"
                      required
                      value={formData.addressLine1}
                      error={errors.addressLine1}
                      onChange={(v) => updateField('addressLine1', v)}
                    />

                    <OutlinedField
                      id="addressLine2"
                      label="Road name, Area, Colony"
                      value={formData.addressLine2}
                      onChange={(v) => updateField('addressLine2', v)}
                    />

                    <div>
                      <p className="text-sm font-medium mb-3">Type of address</p>
                      <div className="flex gap-3">
                        {typeOptions.map((opt) => (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => setFormData({ ...formData, type: opt.value })}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium transition-colors ${
                              formData.type === opt.value
                                ? 'border-primary text-primary bg-primary/5'
                                : 'border-border text-muted-foreground hover:border-primary/40'
                            }`}
                          >
                            {opt.icon}
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <Button type="submit" className="w-full h-12" disabled={isSubmitting}>
                      {isSubmitting ? 'Saving…' : editingAddress ? 'Update Address' : 'Save Address'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </>
          ) : (
          <>
          <h1 className="text-2xl font-bold mb-6">Select Delivery Address</h1>

          {/* Add Address Button */}
          <Button
            variant="outline"
            className="w-full mb-6 border-dashed border-2 h-16"
            onClick={() => handleOpenForm()}
          >
            <Plus className="w-5 h-5 mr-2" />
            Add New Address
          </Button>

          {/* Address List */}
          {isLoading ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">Loading addresses…</p>
            </Card>
          ) : addresses.length === 0 ? (
            <Card className="p-8 text-center">
              <MapPin className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No addresses saved yet</p>
              <p className="text-sm text-muted-foreground">Add a new address to continue</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {addresses.map((address) => (
                <Card 
                  key={address.id}
                  className={`cursor-pointer transition-all ${
                    selectedAddressId === address.id 
                      ? 'ring-2 ring-primary border-primary' 
                      : 'hover:border-primary/50'
                  }`}
                  onClick={() => handleSelect(address.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-muted rounded text-xs font-medium capitalize">
                            {getTypeIcon(address.type)}
                            {address.type}
                          </span>
                          {address.isDefault && (
                            <span className="px-2 py-0.5 bg-primary/10 text-primary rounded text-xs font-medium">
                              Default
                            </span>
                          )}
                        </div>
                        <h3 className="font-semibold">{address.name}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {address.addressLine1}
                          {address.addressLine2 && `, ${address.addressLine2}`}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {address.city}, {address.state} - {address.pincode}
                        </p>
                        <p className="text-sm mt-1">Phone: {address.phone}</p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {selectedAddressId === address.id && (
                          <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                            <Check className="w-4 h-4 text-primary-foreground" />
                          </div>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenForm(address);
                          }}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteId(address.id);
                          }}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Delete Confirmation */}
          <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Address?</AlertDialogTitle>
                <AlertDialogDescription>
                  This address will be permanently removed. You can add a new one later.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Continue Button */}
          <div className="mt-8">
            <Button
              className="w-full h-12 text-lg"
              onClick={handleContinue}
              disabled={!selectedAddressId}
            >
              Continue to Review Order
            </Button>
          </div>
          </>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
};

export default AddressSelect;
