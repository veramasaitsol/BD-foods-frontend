import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { User, Mail, Phone, Edit2, Save, X, Loader2, ArrowLeft } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '@/lib/api';

// The /user/profile endpoints are camelCase and lowercase, unlike the
// uppercase-legacy /user/login and /user/register shapes used elsewhere.
interface ProfileData {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  status: string;
}

const Profile: React.FC = () => {
  const { toast } = useToast();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '' });

  useEffect(() => {
    let mounted = true;

    apiFetch<ProfileData>('/user/profile')
      .then((response) => {
        if (!mounted || !response.data) return;
        setProfile(response.data);
        setFormData({ name: response.data.name || '', phone: response.data.phone || '' });
      })
      .catch((error: unknown) => {
        toast({
          title: 'Could not load profile',
          description: error instanceof Error ? error.message : 'Something went wrong',
          variant: 'destructive',
        });
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await apiFetch<ProfileData>('/user/profile', {
        method: 'PUT',
        body: JSON.stringify({ name: formData.name, phone: formData.phone }),
      });
      if (response.data) setProfile(response.data);
      toast({
        title: 'Profile Updated',
        description: 'Your profile has been updated successfully.',
      });
      setIsEditing(false);
    } catch (error) {
      toast({
        title: 'Could not update profile',
        description: error instanceof Error ? error.message : 'Something went wrong',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (profile) setFormData({ name: profile.name || '', phone: profile.phone || '' });
    setIsEditing(false);
  };

  const navigate = useNavigate();

  return (
    <>
      <Helmet>
        <title>My Profile - Brundhavanam Desi Foods</title>
        <meta name="description" content="Manage your profile settings" />
      </Helmet>

      <Navbar />

      <main className="min-h-screen bg-muted/30 py-8">
        <div className="container max-w-3xl mx-auto px-4">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-8">
            My Profile
          </h1>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                Personal Information
              </CardTitle>
              {isLoading ? null : !isEditing ? (
                <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                  <Edit2 className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleCancel} disabled={isSaving}>
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleSave} disabled={isSaving}>
                    {isSaving ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    Save
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent className="space-y-6">
              {isLoading ? (
                <p className="text-center text-muted-foreground py-8">Loading profile…</p>
              ) : (
                <>
                  <div className="flex justify-center mb-6">
                    <div className="w-24 h-24 rounded-full bg-gradient-primary flex items-center justify-center">
                      <span className="text-primary-foreground font-display font-bold text-3xl">
                        {profile?.name?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name" className="flex items-center gap-2 mb-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        Full Name
                      </Label>
                      {isEditing ? (
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                      ) : (
                        <p className="text-foreground font-medium py-2">{profile?.name || 'Not set'}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="email" className="flex items-center gap-2 mb-2">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        Email Address
                      </Label>
                      <p className="text-foreground font-medium py-2">{profile?.email || 'Not set'}</p>
                      {isEditing && (
                        <p className="text-xs text-muted-foreground">Email cannot be changed.</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="phone" className="flex items-center gap-2 mb-2">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        Phone Number
                      </Label>
                      {isEditing ? (
                        <Input
                          id="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        />
                      ) : (
                        <p className="text-foreground font-medium py-2">{profile?.phone || 'Not set'}</p>
                      )}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default Profile;
