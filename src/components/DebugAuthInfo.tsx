import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Bug, X } from 'lucide-react';
import { useState } from 'react';

export function DebugAuthInfo() {
  const { user, userRole, profile, session, loading } = useAuth();
  const [isVisible, setIsVisible] = useState(false);

  // Hide completely in production
  const isProduction = window.location.hostname !== 'localhost' && 
                       window.location.hostname !== '127.0.0.1';
  
  if (isProduction) return null;

  // Show toggle button
  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 p-3 bg-gray-800 text-white rounded-full shadow-lg hover:bg-gray-700 z-50"
        title="Show Debug Info"
      >
        <Bug className="h-5 w-5" />
      </button>
    );
  }

  return (
    <Card className="fixed bottom-4 right-4 max-w-md z-50 shadow-lg max-h-[80vh] overflow-y-auto">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Bug className="h-4 w-4" />
            Debug Auth Info
          </CardTitle>
          <button
            onClick={() => setIsVisible(false)}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </CardHeader>
      <CardContent className="text-xs space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Loading:</span>
          <Badge variant={loading ? "default" : "outline"}>
            {loading ? 'Yes' : 'No'}
          </Badge>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-gray-600">User:</span>
          <Badge variant={user ? "default" : "outline"}>
            {user ? 'Logged In' : 'Not Logged In'}
          </Badge>
        </div>

        {user && (
          <>
            <div className="border-t pt-2">
              <p className="text-gray-600 mb-1">User ID:</p>
              <code className="text-xs bg-gray-100 p-1 rounded block overflow-x-auto">
                {user.id}
              </code>
            </div>

            <div>
              <p className="text-gray-600 mb-1">Email:</p>
              <code className="text-xs bg-gray-100 p-1 rounded block">
                {user.email}
              </code>
            </div>
          </>
        )}

        <div className="flex items-center justify-between">
          <span className="text-gray-600">Role:</span>
          <Badge variant={userRole ? "default" : "outline"}>
            {userRole || 'None'}
          </Badge>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-gray-600">Profile:</span>
          <Badge variant={profile ? "default" : "outline"}>
            {profile ? 'Loaded' : 'Not Loaded'}
          </Badge>
        </div>

        {profile && (
          <div>
            <p className="text-gray-600 mb-1">Profile Data:</p>
            <code className="text-xs bg-gray-100 p-1 rounded block overflow-x-auto max-h-32">
              {JSON.stringify(profile, null, 2)}
            </code>
          </div>
        )}

        <div className="flex items-center justify-between">
          <span className="text-gray-600">Session:</span>
          <Badge variant={session ? "default" : "outline"}>
            {session ? 'Active' : 'None'}
          </Badge>
        </div>

        {session && (
          <div>
            <p className="text-gray-600 mb-1">Access Token (first 20 chars):</p>
            <code className="text-xs bg-gray-100 p-1 rounded block overflow-x-auto">
              {session.access_token?.substring(0, 20)}...
            </code>
          </div>
        )}
      </CardContent>
    </Card>
  );
}