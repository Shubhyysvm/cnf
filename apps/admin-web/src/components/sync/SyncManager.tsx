"use client";

import React, { useState } from "react";
import { 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Trash2, 
  PlusCircle,
  Package,
  Database,
  HardDrive,
  ChevronDown,
  ChevronRight,
  Loader2
} from "lucide-react";
import toast from "react-hot-toast";
import { AdminApiClient } from "@countrynaturalfoods/admin-api-client";

interface SyncResult {
  productId: string;
  orphanedFiles: string[];
  missingFiles: string[];
  syncedFiles: string[];
  errors: string[];
}

interface SyncSummary {
  totalProducts: number;
  totalImages: number;
  orphanedFiles: number;
  missingFiles: number;
  syncedFiles: number;
  errors: number;
  results: SyncResult[];
}

interface SyncManagerProps {
  apiClient: AdminApiClient;
}

export const SyncManager: React.FC<SyncManagerProps> = ({ apiClient }) => {
  const [checking, setChecking] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncData, setSyncData] = useState<SyncSummary | null>(null);
  const [expandedProducts, setExpandedProducts] = useState<Set<string>>(new Set());
  const [syncingProducts, setSyncingProducts] = useState<Set<string>>(new Set());

  const checkSync = async () => {
    setChecking(true);
    try {
      const response = await apiClient.sync.checkAllProductsSync();
      setSyncData(response.data);
      
      const totalIssues = response.data.orphanedFiles + response.data.missingFiles;
      if (totalIssues === 0) {
        toast.success("✅ Everything is perfectly synced!");
      } else {
        toast(`⚠️ Found ${totalIssues} sync issue${totalIssues > 1 ? 's' : ''}`, {
          icon: '⚠️',
          style: {
            borderRadius: '8px',
            background: '#FEF3C7',
            color: '#92400E',
            border: '1px solid #FCD34D',
          },
        });
      }
    } catch (error) {
      console.error("Failed to check sync:", error);
      toast.error("Failed to check sync status");
    } finally {
      setChecking(false);
    }
  };

  const syncAll = async (options: { removeOrphaned: boolean; recreateMissing: boolean }) => {
    if (!confirm(
      `This will ${options.removeOrphaned ? 'delete orphaned files and ' : ''}${options.recreateMissing ? 'recreate missing records' : ''}. Continue?`
    )) {
      return;
    }

    setSyncing(true);
    try {
      const response = await apiClient.sync.syncAllProducts(options);
      setSyncData(response.data);
      
      const fixed = (options.removeOrphaned ? response.data.orphanedFiles : 0) + 
                    (options.recreateMissing ? response.data.missingFiles : 0);
      toast.success(`✅ Fixed ${fixed} issue${fixed > 1 ? 's' : ''}!`);
    } catch (error) {
      console.error("Failed to sync:", error);
      toast.error("Failed to sync products");
    } finally {
      setSyncing(false);
    }
  };

  const syncProduct = async (
    productId: string, 
    options: { removeOrphaned: boolean; recreateMissing: boolean }
  ) => {
    setSyncingProducts(prev => new Set(prev).add(productId));
    try {
      const response = await apiClient.sync.syncProduct(productId, options);
      
      // Update the specific product in syncData
      if (syncData) {
        const updatedResults = syncData.results.map(r => 
          r.productId === productId ? response.data : r
        );
        setSyncData({
          ...syncData,
          results: updatedResults,
          orphanedFiles: updatedResults.reduce((sum, r) => sum + r.orphanedFiles.length, 0),
          missingFiles: updatedResults.reduce((sum, r) => sum + r.missingFiles.length, 0),
        });
      }
      
      toast.success("✅ Product synced successfully!");
    } catch (error) {
      console.error("Failed to sync product:", error);
      toast.error("Failed to sync product");
    } finally {
      setSyncingProducts(prev => {
        const next = new Set(prev);
        next.delete(productId);
        return next;
      });
    }
  };

  const toggleProductExpand = (productId: string) => {
    setExpandedProducts(prev => {
      const next = new Set(prev);
      if (next.has(productId)) {
        next.delete(productId);
      } else {
        next.add(productId);
      }
      return next;
    });
  };

  const hasIssues = syncData && (syncData.orphanedFiles > 0 || syncData.missingFiles > 0);
  const productsWithIssues = syncData?.results.filter(
    r => r.orphanedFiles.length > 0 || r.missingFiles.length > 0
  ) || [];

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="rounded-lg border-2 border-slate-200 bg-white p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <RefreshCw size={24} className="text-emerald-600" />
              MinIO ↔ Database Sync Manager
            </h3>
            <p className="text-sm text-slate-600 mt-1">
              Check and fix inconsistencies between your storage and database
            </p>
          </div>
          <button
            onClick={checkSync}
            disabled={checking}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {checking ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Checking...
              </>
            ) : (
              <>
                <RefreshCw size={18} />
                Check Sync Status
              </>
            )}
          </button>
        </div>

        {/* Info Box */}
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm">
          <p className="text-blue-900 font-medium mb-2">💡 How it works:</p>
          <ul className="text-blue-800 space-y-1 text-xs">
            <li>• <strong>Check</strong> - Scans all products to find sync issues (doesn't change anything)</li>
            <li>• <strong>Orphaned Files</strong> - Images in MinIO storage but not in database</li>
            <li>• <strong>Missing Files</strong> - Database records pointing to non-existent MinIO files</li>
            <li>• <strong>Flexible Fix</strong> - Choose what to fix: orphaned, missing, or both</li>
          </ul>
        </div>
      </div>

      {/* Results Section */}
      {syncData && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-lg border-2 border-slate-200 bg-white p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Package size={20} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-600">Total Products</p>
                  <p className="text-2xl font-bold text-slate-900">{syncData.totalProducts}</p>
                </div>
              </div>
            </div>

            <div className="rounded-lg border-2 border-green-200 bg-green-50 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                  <CheckCircle2 size={20} className="text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-green-700">Synced Files</p>
                  <p className="text-2xl font-bold text-green-900">{syncData.syncedFiles}</p>
                </div>
              </div>
            </div>

            <div className="rounded-lg border-2 border-orange-200 bg-orange-50 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                  <HardDrive size={20} className="text-orange-600" />
                </div>
                <div>
                  <p className="text-xs text-orange-700">Orphaned Files</p>
                  <p className="text-2xl font-bold text-orange-900">{syncData.orphanedFiles}</p>
                </div>
              </div>
            </div>

            <div className="rounded-lg border-2 border-red-200 bg-red-50 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                  <Database size={20} className="text-red-600" />
                </div>
                <div>
                  <p className="text-xs text-red-700">Missing Files</p>
                  <p className="text-2xl font-bold text-red-900">{syncData.missingFiles}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Status Message */}
          {!hasIssues ? (
            <div className="rounded-lg border-2 border-green-200 bg-green-50 p-6 text-center">
              <CheckCircle2 size={48} className="mx-auto mb-3 text-green-600" />
              <h4 className="text-lg font-bold text-green-900 mb-1">Perfect Sync! ✨</h4>
              <p className="text-sm text-green-700">
                All {syncData.totalImages} images are perfectly synced between MinIO and Database
              </p>
            </div>
          ) : (
            <>
              {/* Bulk Actions */}
              <div className="rounded-lg border-2 border-orange-200 bg-orange-50 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="text-lg font-bold text-orange-900 flex items-center gap-2">
                      <AlertTriangle size={20} />
                      Sync Issues Found
                    </h4>
                    <p className="text-sm text-orange-700 mt-1">
                      {productsWithIssues.length} product{productsWithIssues.length > 1 ? 's have' : ' has'} sync issues
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {syncData.orphanedFiles > 0 && (
                      <button
                        onClick={() => syncAll({ removeOrphaned: true, recreateMissing: false })}
                        disabled={syncing}
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-orange-600 text-white text-sm font-medium hover:bg-orange-700 transition disabled:opacity-50"
                      >
                        <Trash2 size={16} />
                        Remove All Orphaned ({syncData.orphanedFiles})
                      </button>
                    )}
                    {syncData.missingFiles > 0 && (
                      <button
                        onClick={() => syncAll({ removeOrphaned: false, recreateMissing: true })}
                        disabled={syncing}
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition disabled:opacity-50"
                      >
                        <PlusCircle size={16} />
                        Recreate All Missing ({syncData.missingFiles})
                      </button>
                    )}
                    {hasIssues && (
                      <button
                        onClick={() => syncAll({ removeOrphaned: true, recreateMissing: true })}
                        disabled={syncing}
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition disabled:opacity-50"
                      >
                        {syncing ? (
                          <>
                            <Loader2 size={16} className="animate-spin" />
                            Syncing...
                          </>
                        ) : (
                          <>
                            <RefreshCw size={16} />
                            Fix All Issues
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Products with Issues */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                  Products with Issues ({productsWithIssues.length})
                </h4>
                {productsWithIssues.map((result) => {
                  const isExpanded = expandedProducts.has(result.productId);
                  const isSyncing = syncingProducts.has(result.productId);
                  const hasOrphaned = result.orphanedFiles.length > 0;
                  const hasMissing = result.missingFiles.length > 0;

                  return (
                    <div
                      key={result.productId}
                      className="rounded-lg border-2 border-slate-200 bg-white overflow-hidden"
                    >
                      {/* Product Header */}
                      <div className="p-4 bg-slate-50 border-b border-slate-200">
                        <div className="flex items-center justify-between">
                          <button
                            onClick={() => toggleProductExpand(result.productId)}
                            className="flex items-center gap-3 text-left flex-1"
                          >
                            {isExpanded ? (
                              <ChevronDown size={20} className="text-slate-400" />
                            ) : (
                              <ChevronRight size={20} className="text-slate-400" />
                            )}
                            <div>
                              <p className="text-sm font-bold text-slate-900">
                                Product ID: {result.productId.slice(0, 8)}...
                              </p>
                              <p className="text-xs text-slate-600">
                                {hasOrphaned && `${result.orphanedFiles.length} orphaned`}
                                {hasOrphaned && hasMissing && ' • '}
                                {hasMissing && `${result.missingFiles.length} missing`}
                              </p>
                            </div>
                          </button>
                          <div className="flex gap-2">
                            {hasOrphaned && (
                              <button
                                onClick={() => syncProduct(result.productId, { 
                                  removeOrphaned: true, 
                                  recreateMissing: false 
                                })}
                                disabled={isSyncing}
                                className="px-3 py-1.5 rounded bg-orange-100 text-orange-700 text-xs font-medium hover:bg-orange-200 transition disabled:opacity-50"
                              >
                                Remove Orphaned
                              </button>
                            )}
                            {hasMissing && (
                              <button
                                onClick={() => syncProduct(result.productId, { 
                                  removeOrphaned: false, 
                                  recreateMissing: true 
                                })}
                                disabled={isSyncing}
                                className="px-3 py-1.5 rounded bg-red-100 text-red-700 text-xs font-medium hover:bg-red-200 transition disabled:opacity-50"
                              >
                                Recreate Missing
                              </button>
                            )}
                            <button
                              onClick={() => syncProduct(result.productId, { 
                                removeOrphaned: true, 
                                recreateMissing: true 
                              })}
                              disabled={isSyncing}
                              className="px-3 py-1.5 rounded bg-emerald-600 text-white text-xs font-medium hover:bg-emerald-700 transition disabled:opacity-50"
                            >
                              {isSyncing ? 'Syncing...' : 'Fix Both'}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Expanded Details */}
                      {isExpanded && (
                        <div className="p-4 space-y-4">
                          {result.orphanedFiles.length > 0 && (
                            <div>
                              <h5 className="text-xs font-bold text-orange-900 uppercase mb-2 flex items-center gap-2">
                                <HardDrive size={14} />
                                Orphaned Files in MinIO ({result.orphanedFiles.length})
                              </h5>
                              <div className="space-y-1">
                                {result.orphanedFiles.map((file, idx) => (
                                  <div
                                    key={idx}
                                    className="text-xs font-mono bg-orange-50 border border-orange-200 rounded px-3 py-2 text-orange-900"
                                  >
                                    {file}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {result.missingFiles.length > 0 && (
                            <div>
                              <h5 className="text-xs font-bold text-red-900 uppercase mb-2 flex items-center gap-2">
                                <Database size={14} />
                                Missing Files in MinIO ({result.missingFiles.length})
                              </h5>
                              <div className="space-y-1">
                                {result.missingFiles.map((file, idx) => (
                                  <div
                                    key={idx}
                                    className="text-xs font-mono bg-red-50 border border-red-200 rounded px-3 py-2 text-red-900"
                                  >
                                    {file}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {result.errors.length > 0 && (
                            <div>
                              <h5 className="text-xs font-bold text-red-900 uppercase mb-2 flex items-center gap-2">
                                <XCircle size={14} />
                                Errors ({result.errors.length})
                              </h5>
                              <div className="space-y-1">
                                {result.errors.map((error, idx) => (
                                  <div
                                    key={idx}
                                    className="text-xs bg-red-50 border border-red-200 rounded px-3 py-2 text-red-900"
                                  >
                                    {error}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};
