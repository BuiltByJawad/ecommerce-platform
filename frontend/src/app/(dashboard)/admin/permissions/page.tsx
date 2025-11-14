'use client';

import { useTheme } from 'next-themes';
import React, { useState, useEffect, ChangeEvent } from 'react';

// Define interfaces for our data structures
interface ActivityPermissions {
  view: boolean;
  edit: boolean;
  delete: boolean;
  add: boolean;
  [key: string]: boolean; // Index signature for dynamic access
}

interface ModulePermission {
  id: string;
  name: string;
  activities: ActivityPermissions;
}

interface RolePermissions {
  [roleKey: string]: ModulePermission[];
}

interface RoleOption {
  value: string;
  label: string;
}

// Initial sample data for roles and their permissions with types
const initialPermissionsData: RolePermissions = {
  admin: [
    {
      id: 'module1',
      name: 'User Management',
      activities: { view: true, edit: true, delete: true, add: true },
    },
    {
      id: 'module2',
      name: 'System Configuration',
      activities: { view: true, edit: true, delete: false, add: true },
    },
    {
      id: 'module3',
      name: 'Audit Logs',
      activities: { view: true, edit: false, delete: false, add: false },
    },
    {
      id: 'module4',
      name: 'Billing & Subscriptions',
      activities: { view: true, edit: true, delete: true, add: true },
    },
  ],
  company: [
    {
      id: 'module1', // Note: Same ID as admin's "User Management"
      name: 'Profile Management',
      activities: { view: true, edit: true, delete: false, add: false },
    },
    {
      id: 'module2', // Note: Same ID as admin's "System Configuration"
      name: 'Dashboard Analytics',
      activities: { view: true, edit: false, delete: false, add: false },
    },
    {
      id: 'module3', // Note: Same ID as admin's "Audit Logs"
      name: 'Team Members',
      activities: { view: true, edit: true, delete: true, add: true },
    },
    {
      id: 'module5', // New module ID specific to company
      name: 'Reporting',
      activities: { view: true, edit: false, delete: false, add: false },
    },
  ],
  editor: [
    {
      id: 'module1',
      name: 'Content Creation', // Again, module1 with a different name
      activities: { view: true, edit: true, delete: false, add: true },
    },
    {
      id: 'module2',
      name: 'Media Library',
      activities: { view: true, edit: true, delete: true, add: true },
    },
    {
      id: 'module6', // New module ID
      name: 'Review Queue', // Name was "Review Queue" for module3 in original editor, making it module6 for clarity
      activities: { view: true, edit: false, delete: false, add: false },
    },
  ],
  viewer: [
    {
      id: 'module1',
      name: 'Public Content',
      activities: { view: true, edit: false, delete: false, add: false },
    },
    {
      id: 'module7', // New module ID
      name: 'Knowledge Base', // Name was "Knowledge Base" for module2 in original viewer
      activities: { view: true, edit: false, delete: false, add: false },
    },
  ],
};

// Helper function to get all unique system modules
// The name for a module ID will be taken from its first appearance in initialPermissionsData
const generateAllSystemModules = (
  permissionsData: RolePermissions
): { id: string; name: string }[] => {
  const modulesMap = new Map<string, { id: string; name: string }>();
  Object.values(permissionsData).forEach((roleModules) => {
    roleModules.forEach((module) => {
      if (!modulesMap.has(module.id)) {
        modulesMap.set(module.id, { id: module.id, name: module.name });
      }
    });
  });
  // Sort by ID for consistent order, or any other preferred order
  return Array.from(modulesMap.values()).sort((a, b) => a.id.localeCompare(b.id));
};

// Master list of all unique modules in the system
const allSystemModulesList = generateAllSystemModules(initialPermissionsData);

// Available roles for the dropdown with types
const roles: RoleOption[] = [
  { value: 'admin', label: 'Administrator' },
  { value: 'company', label: 'Company Manager' },
  { value: 'editor', label: 'Content Editor' },
  { value: 'viewer', label: 'Viewer' },
];

// List of all possible activities to be used as table headers
const allActivities: string[] = ['View', 'Edit', 'Delete', 'Add'];

// Define the component as a Next.js page
const RolePermissionPage: React.FC = () => {
  const { theme } = useTheme(); // `theme` will be 'light', 'dark', or 'system'
  const [selectedRole, setSelectedRole] = useState<string>(roles[0].value);
  const [editablePermissionsData, setEditablePermissionsData] = useState<RolePermissions>(
    JSON.parse(JSON.stringify(initialPermissionsData))
  );
  const [currentPermissions, setCurrentPermissions] = useState<ModulePermission[]>([]);

  useEffect(() => {
    const roleSpecificPermissions = editablePermissionsData[selectedRole] || [];

    const newCurrentPermissions = allSystemModulesList.map((systemModule) => {
      const existingModuleForRole = roleSpecificPermissions.find(
        (rpm) => rpm.id === systemModule.id
      );

      if (existingModuleForRole) {
        // If module exists for the role, use its specific data (including name and activities)
        return JSON.parse(JSON.stringify(existingModuleForRole)); // Deep copy
      } else {
        // If module is a system module but not yet configured for this role,
        // add it with the canonical name from allSystemModulesList and default (all false) activities.
        return {
          id: systemModule.id,
          name: systemModule.name, // Use the name from the derived system list
          activities: {
            view: false,
            edit: false,
            delete: false,
            add: false,
          },
        };
      }
    });
    setCurrentPermissions(newCurrentPermissions);
  }, [selectedRole, editablePermissionsData]);

  const handleRoleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setSelectedRole(event.target.value);
  };

  const handlePermissionChange = (moduleId: string, activityKey: string) => {
    // 1. Update the local `currentPermissions` for immediate UI feedback
    const updatedCurrentPermissions = currentPermissions.map((module) => {
      if (module.id === moduleId) {
        return {
          ...module,
          activities: {
            ...module.activities,
            [activityKey]: !module.activities[activityKey],
          },
        };
      }
      return module;
    });
    setCurrentPermissions(updatedCurrentPermissions);

    // 2. Update the master `editablePermissionsData`
    setEditablePermissionsData((prevMasterData) => {
      const newMasterData = JSON.parse(JSON.stringify(prevMasterData));

      const moduleToUpdateFromCurrentState = updatedCurrentPermissions.find(
        (m) => m.id === moduleId
      );

      // This should ideally not happen if logic is correct
      if (!moduleToUpdateFromCurrentState) return prevMasterData;

      // Ensure the role array exists in the master data
      if (!newMasterData[selectedRole]) {
        newMasterData[selectedRole] = [];
      }

      const moduleIndexInRole = newMasterData[selectedRole].findIndex(
        (m: ModulePermission) => m.id === moduleId
      );

      if (moduleIndexInRole !== -1) {
        // Module already exists for this role, update its activities
        newMasterData[selectedRole][moduleIndexInRole].activities = {
          ...moduleToUpdateFromCurrentState.activities,
        };
        // Optionally, update the name if it could change dynamically,
        // though current logic uses the name from system list or existing data.
        // newMasterData[selectedRole][moduleIndexInRole].name = moduleToUpdateFromCurrentState.name;
      } else {
        // Module does not exist for this role in master data, so add it.
        // The name comes from moduleToUpdateFromCurrentState, which was sourced either
        // from an existing entry or from allSystemModulesList.
        newMasterData[selectedRole].push({
          id: moduleId,
          name: moduleToUpdateFromCurrentState.name,
          activities: { ...moduleToUpdateFromCurrentState.activities },
        });
      }
      return newMasterData;
    });
  };

  return (
    // Main container: Applies base light theme styles and dark theme overrides
    <div
      className={`${theme} dark:bg-gradient-to-br dark:from-slate-900 dark:to-slate-800 p-2 font-sans text-slate-900 dark:text-slate-200`}
    >
      <div className='container mx-auto w-full'>
        {/* Header */}
        <header className='mb-2 text-start'>
          <h1
            className='text-lg font-bold tracking-tight bg-clip-text 
           sm:text-xl'
          >
            User Role Settings
          </h1>
        </header>

        {/* Role Selector Card */}
        <div className='bg-white dark:bg-slate-800 shadow-xl dark:shadow-2xl rounded-xl p-4 mb-2 border border-slate-200 dark:border-slate-700'>
          <label htmlFor='role-select' className='block text-lg font-medium mb-2'>
            Select Role:
          </label>
          <div className='relative'>
            <select
              id='role-select'
              value={selectedRole}
              onChange={handleRoleChange}
              className='block w-full appearance-none rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 py-3 px-4 pr-8 leading-tight text-slate-900 dark:text-slate-100 focus:outline-none focus:bg-white dark:focus:bg-slate-600 focus:border-sky-500 dark:focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all duration-150 ease-in-out'
            >
              {roles.map((role) => (
                <option
                  key={role.value}
                  value={role.value}
                  className='bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-slate-100'
                >
                  {role.label}
                </option>
              ))}
            </select>
            <div className='pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500 dark:text-slate-400'>
              <svg
                className='fill-current h-4 w-4'
                xmlns='http://www.w3.org/2000/svg'
                viewBox='0 0 20 20'
              >
                <path d='M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z' />
              </svg>
            </div>
          </div>
        </div>

        {/* Permissions Table Card */}
        <div className='bg-white dark:bg-slate-800 shadow-xl dark:shadow-2xl rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700'>
          <div className='p-4'>
            <h2 className='text-2xl font-semibold text-sky-600 dark:text-sky-400 mb-1'>
              Permissions for:{' '}
              <span className='font-bold text-slate-900 dark:text-slate-100'>
                {roles.find((r) => r.value === selectedRole)?.label}
              </span>
            </h2>
          </div>

          {currentPermissions.length > 0 ? (
            <div className='overflow-x-auto'>
              <table className='min-w-full divide-y divide-slate-200 dark:divide-slate-700'>
                <thead className='bg-slate-50 dark:bg-slate-700/50'>
                  <tr>
                    <th
                      scope='col'
                      className='py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-slate-800 dark:text-slate-100 sm:pl-6'
                    >
                      Module
                    </th>
                    {allActivities.map((activity) => (
                      <th
                        key={activity}
                        scope='col'
                        className='px-3 py-3.5 text-center text-sm font-semibold text-slate-800 dark:text-slate-100'
                      >
                        {activity}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className='divide-y divide-slate-200 dark:divide-slate-700 bg-white dark:bg-slate-800'>
                  {currentPermissions.map((permissionModule) => (
                    <tr
                      key={permissionModule.id}
                      className='hover:bg-slate-100/50 dark:hover:bg-slate-700/30 transition-colors duration-150'
                    >
                      <td className='whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-slate-800 dark:text-slate-100 sm:pl-6'>
                        {permissionModule.name}
                      </td>
                      {allActivities.map((activity) => {
                        const activityKey = activity.toLowerCase();
                        return (
                          <td
                            key={`${permissionModule.id}-${activityKey}`}
                            className='whitespace-nowrap px-3 py-4 text-sm'
                          >
                            <div className='flex justify-center'>
                              <input
                                type='checkbox'
                                className="h-5 w-5 rounded border-slate-400 dark:border-slate-500 text-sky-600 dark:text-sky-500 focus:ring-sky-500 focus:ring-offset-white dark:focus:ring-offset-slate-800 bg-slate-200 dark:bg-slate-600 cursor-pointer appearance-none checked:bg-sky-500 dark:checked:bg-sky-500 checked:border-sky-500 dark:checked:border-sky-500 relative
                                               before:content-[''] before:absolute before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:w-3 before:h-3 before:scale-0 checked:before:scale-100 before:bg-no-repeat before:bg-center 
                                               before:bg-[url('data:image/svg+xml;utf8,<svg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2016%2016%22%20fill%3D%22white%22><path%20d%3D%22M12.207%204.793a1%201%200%20010%201.414l-5%205a1%201%200%2001-1.414%200l-2-2a1%201%200%20011.414-1.414L6.5%209.086l4.293-4.293a1%201%200%20011.414%200z%22%2F><%2Fsvg>')]
                                               transition-all duration-150"
                                checked={permissionModule.activities[activityKey] || false}
                                onChange={() =>
                                  handlePermissionChange(permissionModule.id, activityKey)
                                }
                                aria-label={`Permission for ${permissionModule.name} - ${activity}`}
                              />
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className='p-6 text-center text-slate-500 dark:text-slate-400'>
              <p className='text-lg'>No modules available or an error occurred.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RolePermissionPage;
