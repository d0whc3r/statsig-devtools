import { AlertCircle, Edit, Key, Save, User, X } from 'lucide-react'
import { useEffect, useState } from 'react'

import { Badge } from '@/src/components/ui/Badge/Badge'
import { Button } from '@/src/components/ui/Button/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/Card/Card'
import { Input } from '@/src/components/ui/Input/Input'
import { Label } from '@/src/components/ui/Label/Label'
import { useApiOverrides } from '@/src/hooks/useApiOverrides'
import { useUserInfo } from '@/src/hooks/useUserInfo'
import { tabCommunication } from '@/src/utils/tab-communication'

export function UserInfoPanel() {
  const { userInfo, isAuthenticated, setUserIdentifier, clearUserIdentifier, getUserType } = useUserInfo()
  const { overrides } = useApiOverrides()
  const [tabUserInfo, setTabUserInfo] = useState<{ userID?: string; stableID?: string } | null>(null)
  const [isLoadingTabUser, setIsLoadingTabUser] = useState(false)

  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState('')
  const [editType, setEditType] = useState<'userID' | 'stableID'>('userID')

  const apiOverridesCount = overrides.length
  const currentUserType = getUserType()

  // Load user info from tab
  useEffect(() => {
    const loadTabUserInfo = async () => {
      setIsLoadingTabUser(true)
      try {
        const userInfo = await tabCommunication.getUserInfo()
        setTabUserInfo(userInfo)
      } catch (error) {
        console.error('Error loading tab user info:', error)
      } finally {
        setIsLoadingTabUser(false)
      }
    }

    loadTabUserInfo()
  }, [])

  const handleStartEdit = () => {
    setEditValue(userInfo.userID ?? userInfo.stableID ?? '')
    setEditType(currentUserType === 'userID' ? 'userID' : 'stableID')
    setIsEditing(true)
  }

  const handleSave = () => {
    if (editValue.trim()) {
      setUserIdentifier(editValue.trim(), editType)
    } else {
      clearUserIdentifier()
    }
    setIsEditing(false)
  }

  const handleCancel = () => {
    setIsEditing(false)
    setEditValue('')
  }

  if (!isAuthenticated) {
    return (
      <Card className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm text-orange-800 dark:text-orange-200">
            <AlertCircle className="h-4 w-4" />
            Not Authenticated
          </CardTitle>
          <CardDescription className="text-xs text-orange-700 dark:text-orange-300">
            API overrides are not available. Please log in to use Statsig API features.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm text-blue-800 dark:text-blue-200">
            <User className="h-4 w-4" />
            Current User
          </CardTitle>
          {!isEditing && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleStartEdit}
              className="h-6 w-6 p-0 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
            >
              <Edit className="h-3 w-3" />
            </Button>
          )}
        </div>
        <CardDescription className="text-xs text-blue-700 dark:text-blue-300">
          User information for API overrides
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {isEditing ? (
          <div className="space-y-2">
            <div className="space-y-1">
              <Label className="text-xs text-blue-800 dark:text-blue-200">User ID Type</Label>
              <div className="flex gap-2">
                <Button
                  variant={editType === 'userID' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setEditType('userID')}
                  className="text-xs"
                >
                  User ID
                </Button>
                <Button
                  variant={editType === 'stableID' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setEditType('stableID')}
                  className="text-xs"
                >
                  Stable ID
                </Button>
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-blue-800 dark:text-blue-200">Identifier</Label>
              <Input
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                placeholder={`Enter ${editType}...`}
                className="text-xs"
              />
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSave} className="text-xs">
                <Save className="mr-1 h-3 w-3" />
                Save
              </Button>
              <Button size="sm" variant="outline" onClick={handleCancel} className="text-xs">
                <X className="mr-1 h-3 w-3" />
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* Tab User Info */}
            <div className="rounded-lg border border-green-200 bg-green-50 p-2 dark:border-green-800 dark:bg-green-950/20">
              <div className="mb-1 flex items-center gap-2">
                <Key className="h-3 w-3 text-green-600 dark:text-green-400" />
                <span className="text-xs font-medium text-green-800 dark:text-green-200">Tab User Info</span>
                {isLoadingTabUser && <span className="text-xs text-green-600">Loading...</span>}
              </div>
              {tabUserInfo ? (
                <div className="space-y-1">
                  {tabUserInfo.userID && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-green-700 dark:text-green-300">User ID:</span>
                      <Badge variant="secondary" className="font-mono text-xs">
                        {tabUserInfo.userID}
                      </Badge>
                    </div>
                  )}
                  {tabUserInfo.stableID && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-green-700 dark:text-green-300">Stable ID:</span>
                      <Badge variant="secondary" className="font-mono text-xs">
                        {tabUserInfo.stableID}
                      </Badge>
                    </div>
                  )}
                </div>
              ) : (
                <span className="text-xs text-green-600 dark:text-green-400">
                  {isLoadingTabUser ? 'Loading...' : 'No user info found in tab'}
                </span>
              )}
            </div>

            {/* Local User Info */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Key className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                <span className="text-xs text-blue-800 dark:text-blue-200">Local User ID:</span>
              </div>
              <Badge variant="secondary" className="font-mono text-xs">
                {userInfo.displayName}
              </Badge>
            </div>

            {currentUserType && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-blue-700 dark:text-blue-300">User Type:</span>
                <Badge variant="outline" className="text-xs">
                  {currentUserType === 'userID' ? 'User ID' : 'Stable ID'}
                </Badge>
              </div>
            )}

            <div className="flex items-center justify-between">
              <span className="text-xs text-blue-700 dark:text-blue-300">API Overrides:</span>
              <Badge variant="default" className="text-xs">
                {apiOverridesCount}
              </Badge>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="default" className="text-xs">
                API Connected
              </Badge>
              <span className="text-xs text-blue-700 dark:text-blue-300">Ready for overrides</span>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
