import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  Heart, MessageSquare, FileText, CreditCard, ShieldCheck, 
  Send, ShieldAlert, Check, Clock, Upload, X, Shield 
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import PropertyCard from '../../components/property/PropertyCard';
import Button from '../../components/common/Button';
import { useNotification } from '../../context/NotificationContext';
import useAuth from '../../hooks/useAuth';
import { getFavorites } from '../../services/favoritesService';
import { listConversations, getMessages, sendMessage } from '../../services/messageService';
import { listAgreements, updateAgreementStatus } from '../../services/agreementService';
import { listPayments, updatePaymentStatus } from '../../services/paymentService';
import { getVerificationStatus, submitVerification } from '../../services/verificationService';

const TenantDashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'favorites';
  const { showNotification } = useNotification();
  const {user} = useAuth();
  const queryClient = useQueryClient();

  // Chat State
  const [selectedChat, setSelectedChat] = useState(null);
  const [chatText, setChatText] = useState('');
  
  // Verification State
  const [docType, setDocType] = useState('nid');
  const [selectedFile, setSelectedFile] = useState(null);
  
  // Payment Modal State
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('bKash');
  const [payPhone, setPayPhone] = useState('');
  const [payPin, setPayPin] = useState('');
  const [payOtp, setPayOtp] = useState('');
  const [payStep, setPayStep] = useState(1); // 1 = details/wallet, 2 = otp, 3 = pin

  // Set active tab in search params
  const setActiveTab = (tabId) => {
    setSearchParams({ tab: tabId });
  };

  const chatParam = searchParams.get('chat');

  // Queries
  const { data: favoritesRes, isLoading: favsLoading } = useQuery({
    queryKey: ['tenant-favorites'],
    queryFn: getFavorites,
    enabled: activeTab === 'favorites'
  });

  const { data: chatsRes, isLoading: chatsLoading } = useQuery({
    queryKey: ['conversations', user?.id],
    queryFn: listConversations,
    enabled: activeTab === 'messages' && !!user?.id
  });

  const { data: messagesRes, refetch: refetchMessages } = useQuery({
    queryKey: ['messages', selectedChat, user?.id],
    queryFn: () => getMessages(selectedChat),
    enabled: activeTab === 'messages' && !!selectedChat && !!user?.id,
    refetchInterval: 3000 // Poll messages every 3s
  });

  const { data: agreementsRes, isLoading: agreementsLoading } = useQuery({
    queryKey: ['tenant-agreements'],
    queryFn: listAgreements,
    enabled: activeTab === 'agreements'
  });

  const { data: paymentsRes, isLoading: paymentsLoading } = useQuery({
    queryKey: ['tenant-payments'],
    queryFn: listPayments,
    enabled: activeTab === 'payments'
  });

  const { data: verificationRes, refetch: refetchVerification } = useQuery({
    queryKey: ['verification-status'],
    queryFn: getVerificationStatus,
    enabled: activeTab === 'verification'
  });

  const conversations = chatsRes?.data || [];
  const selectedConversation = conversations.find((chat) => String(chat.conversation_id) === String(selectedChat));

  useEffect(() => {
    if (activeTab !== 'messages' || !chatParam || conversations.length === 0) {
      return;
    }

    const chatExists = conversations.some((chat) => String(chat.conversation_id) === String(chatParam));
    if (chatExists && String(selectedChat) !== String(chatParam)) {
      setSelectedChat(Number(chatParam));
    }
  }, [activeTab, chatParam, conversations, selectedChat]);

  // Mutations
  const sendMessageMutation = useMutation({
    mutationFn: () => sendMessage(selectedChat, chatText),
    onSuccess: () => {
      setChatText('');
      refetchMessages();
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
    onError: (err) => {
      showNotification(err.message || 'Failed to send message', 'error');
    }
  });

  const updateAgreementMutation = useMutation({
    mutationFn: ({ id, status }) => updateAgreementStatus(id, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tenant-agreements'] });
      showNotification(`Agreement ${variables.status} successfully`, 'success');
    },
    onError: (err) => {
      showNotification(err.message || 'Failed to update agreement status', 'error');
    }
  });

  const submitVerificationMutation = useMutation({
    mutationFn: (formData) => submitVerification(formData),
    onSuccess: () => {
      setSelectedFile(null);
      refetchVerification();
      showNotification('Tenant verification document uploaded successfully', 'success');
    },
    onError: (err) => {
      showNotification(err.message || 'Failed to submit verification request', 'error');
    }
  });

  const processPaymentMutation = useMutation({
    mutationFn: () => updatePaymentStatus(
      selectedInvoice.id, 
      'paid', 
      paymentMethod, 
      `TXN-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
    ),
    onSuccess: () => {
      setSelectedInvoice(null);
      setPayStep(1);
      setPayPhone('');
      setPayPin('');
      setPayOtp('');
      queryClient.invalidateQueries({ queryKey: ['tenant-payments'] });
      showNotification('Invoice paid successfully!', 'success');
    },
    onError: (err) => {
      showNotification(err.message || 'Payment execution failed', 'error');
    }
  });

  const handleSendChat = (e) => {
    e.preventDefault();
    if (!chatText.trim()) return;
    sendMessageMutation.mutate();
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleVerificationSubmit = (e) => {
    e.preventDefault();
    if (!selectedFile) {
      showNotification('Please select a document file to upload', 'warning');
      return;
    }
    const formData = new FormData();
    formData.append('documentType', docType);
    formData.append('document', selectedFile);
    submitVerificationMutation.mutate(formData);
  };

  const startCheckout = (invoice) => {
    setSelectedInvoice(invoice);
    setPayStep(1);
  };

  const handlePaymentNext = () => {
    if (payStep === 1) {
      if (!payPhone) {
        showNotification('Please enter wallet number', 'warning');
        return;
      }
      setPayStep(2); // Move to OTP
    } else if (payStep === 2) {
      if (!payOtp) {
        showNotification('Please enter OTP code', 'warning');
        return;
      }
      setPayStep(3); // Move to PIN
    } else if (payStep === 3) {
      if (!payPin) {
        showNotification('Please enter PIN', 'warning');
        return;
      }
      processPaymentMutation.mutate();
    }
  };

  const tabs = [
    { id: 'favorites', label: 'Bookmarked', icon: Heart },
    { id: 'messages', label: 'Conversations', icon: MessageSquare },
    { id: 'agreements', label: 'Agreements', icon: FileText },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'verification', label: 'Verification', icon: ShieldCheck }
  ];

  return (
    <DashboardLayout
      title="Tenant Dashboard"
      tabs={tabs}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
    >
      {/* 1. FAVORITES TAB */}
      {activeTab === 'favorites' && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-slate-800">Your Favorites</h2>
          {favsLoading ? (
            <div className="text-center py-12">Loading favorited properties...</div>
          ) : !favoritesRes?.data || favoritesRes.data.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-slate-100 text-slate-400">
              No bookmarked properties yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {favoritesRes.data.map((fav) => (
                <PropertyCard
                  key={fav.favourite_id}
                  property={{
                    id: fav.id,
                    title: fav.title,
                    price: fav.price,
                    bedrooms: fav.bedrooms,
                    bathrooms: fav.bathrooms,
                    area_sqft: fav.area_sqft,
                    address: fav.address,
                    city: fav.city,
                    listing_type: fav.listing_type,
                    thumbnail_url: fav.thumbnail_url,
                    views_count: fav.views_count
                  }}
                  isFavoritedInitially={true}
                  onFavoriteToggle={() => queryClient.invalidateQueries({ queryKey: ['tenant-favorites'] })}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* 2. MESSAGES TAB */}
      {activeTab === 'messages' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm h-[600px] flex">
          {/* Chat List Left Pane */}
          <div className="w-1/3 border-r border-slate-200 flex flex-col">
            <div className="p-4 border-b border-slate-100 font-bold text-slate-800">Chats</div>
            <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
              {chatsLoading ? (
                <div className="p-4 text-center text-sm text-slate-400">Loading chats...</div>
              ) : !chatsRes?.data || chatsRes.data.length === 0 ? (
                <div className="p-8 text-center text-sm text-slate-400">No active conversations.</div>
              ) : (
                conversations.map((chat) => (
                  <button
                    key={chat.conversation_id}
                    onClick={() => setSelectedChat(chat.conversation_id)}
                    className={`w-full text-left p-4 hover:bg-slate-50 transition-colors flex items-center gap-3 ${
                      selectedChat === chat.conversation_id ? 'bg-emerald-50/50 border-l-4 border-emerald-500' : ''
                    }`}
                  >
                    <img
                      src={`https://api.dicebear.com/7.x/identicon/svg?seed=${chat.other_user_name || chat.other_user_email}`}
                      alt=""
                      className="w-10 h-10 rounded-full border bg-slate-100 object-cover shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex justify-between items-baseline mb-0.5">
                        <p className="text-sm font-bold text-slate-800 truncate">{chat.other_user_name || chat.other_user_email || 'Unknown user'}</p>
                        <p className="text-[10px] text-slate-400 shrink-0">
                          {chat.last_message_time ? new Date(chat.last_message_time).toLocaleDateString() : ''}
                        </p>
                      </div>
                      <p className="text-xs text-slate-400 truncate font-semibold mb-0.5">
                        Prop ID: {chat.property_title || chat.property_id}
                      </p>
                      <p className="text-xs text-slate-500 truncate">{chat.last_message_text || 'No messages yet'}</p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Messages Center Pane */}
          <div className="flex-1 flex flex-col bg-slate-50">
            {selectedChat ? (
              <>
                {/* Chat Partner Header */}
                <div className="p-4 bg-white border-b border-slate-100 flex items-center gap-3 shadow-sm">
                  <div className="font-bold text-slate-800">
                    {selectedConversation?.other_user_id ? (
                      <Link to={`/users/${selectedConversation.other_user_id}/profile`} className="hover:text-emerald-600 transition-colors font-extrabold text-sm sm:text-base">
                        {selectedConversation?.other_user_name || selectedConversation?.other_user_email || 'Conversation Details'}
                      </Link>
                    ) : (
                      selectedConversation?.other_user_name || selectedConversation?.other_user_email || 'Conversation Details'
                    )}
                    {selectedConversation?.property_title && (
                      <p className="text-xs text-slate-400 font-semibold mt-0.5">
                        {selectedConversation.property_title}
                      </p>
                    )}
                  </div>
                </div>

                {/* Messages List */}
                <div className="flex-1 p-4 overflow-y-auto space-y-3 flex flex-col">
                  {messagesRes?.data?.map((msg) => {
                    const msgIsMe = msg.sender_id === user?.id;
                    return (
                      <div
                        key={msg.message_id}
                        className={`max-w-[70%] p-3 rounded-2xl text-sm ${
                          msgIsMe
                            ? 'bg-emerald-600 text-white rounded-br-none self-end'
                            : 'bg-white text-slate-700 rounded-bl-none border border-slate-200 self-start shadow-sm'
                        }`}
                      >
                        <p className="leading-relaxed whitespace-pre-wrap">{msg.message_text}</p>
                        <span className={`text-[9px] block text-right mt-1 font-semibold ${msgIsMe ? 'text-emerald-200' : 'text-slate-400'}`}>
                          {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Send Box */}
                <form onSubmit={handleSendChat} className="p-4 bg-white border-t border-slate-100 flex gap-2">
                  <input
                    type="text"
                    placeholder="Type your message..."
                    value={chatText}
                    onChange={(e) => setChatText(e.target.value)}
                    className="flex-1 border border-slate-200 rounded-xl px-4 py-2.5 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                  <Button type="submit" variant="primary" loading={sendMessageMutation.isPending} className="px-4 py-2 rounded-xl">
                    <Send className="w-4 h-4" />
                  </Button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8">
                <MessageSquare className="w-12 h-12 mb-3 text-slate-350" />
                <p className="font-bold text-sm">Select a conversation to start messaging</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. AGREEMENTS TAB */}
      {activeTab === 'agreements' && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-slate-800">My Rental Agreements</h2>
          {agreementsLoading ? (
            <div className="text-center py-12">Loading agreements...</div>
          ) : !agreementsRes?.data || agreementsRes.data.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-slate-100 text-slate-400">
              No rental agreements drafted yet.
            </div>
          ) : (
            <div className="space-y-4">
              {agreementsRes.data.map((ag) => (
                <div key={ag.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-extrabold text-slate-800">Agreement #{ag.id}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded capitalize ${
                        ag.status === 'accepted' ? 'bg-emerald-100 text-emerald-800' :
                        ag.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {ag.status}
                      </span>
                    </div>
                    <p className="text-sm font-bold text-slate-700">{ag.property_title || `Property ID: ${ag.property_id}`}</p>
                    <p className="text-xs text-slate-500 font-semibold">
                      Landlord:{' '}
                      {ag.owner_id ? (
                        <Link to={`/users/${ag.owner_id}/profile`} className="text-emerald-600 hover:text-emerald-700 font-bold">
                          {ag.owner_name || 'View Profile'}
                        </Link>
                      ) : (
                        ag.owner_name || 'N/A'
                      )}
                    </p>
                    <p className="text-xs text-slate-400">
                      Duration: {new Date(ag.start_date).toLocaleDateString()} to {new Date(ag.end_date).toLocaleDateString()}
                    </p>
                    <div className="flex gap-4 text-xs font-semibold text-slate-500">
                      <span>Rent: {ag.rent_amount} BDT</span>
                      <span>Deposit: {ag.security_deposit} BDT</span>
                    </div>
                    {ag.terms && (
                      <p className="text-xs text-slate-400 italic bg-slate-50 p-2 rounded-lg border border-slate-100">
                        Terms: {ag.terms}
                      </p>
                    )}
                  </div>
                  {ag.status === 'sent' && (
                    <div className="flex gap-2 shrink-0 self-end md:self-auto">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => updateAgreementMutation.mutate({ id: ag.id, status: 'accepted' })}
                        loading={updateAgreementMutation.isPending}
                      >
                        <Check className="w-4 h-4 mr-1.5" /> Accept
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => updateAgreementMutation.mutate({ id: ag.id, status: 'rejected' })}
                        loading={updateAgreementMutation.isPending}
                      >
                        <X className="w-4 h-4 mr-1.5" /> Reject
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 4. PAYMENTS TAB */}
      {activeTab === 'payments' && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-slate-800">Billing & Invoices</h2>
          {paymentsLoading ? (
            <div className="text-center py-12">Loading payments ledger...</div>
          ) : !paymentsRes?.data || paymentsRes.data.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-slate-100 text-slate-400">
              No invoices generated yet.
            </div>
          ) : (
            <div className="space-y-4">
              {paymentsRes.data.map((invoice) => (
                <div key={invoice.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-extrabold text-slate-800">Invoice #{invoice.id}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded capitalize ${
                        invoice.status === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {invoice.status}
                      </span>
                    </div>
                    <p className="text-sm font-bold text-slate-700">{invoice.property_title}</p>
                    <p className="text-xs text-slate-500 font-semibold">
                      Landlord:{' '}
                      {invoice.owner_id ? (
                        <Link to={`/users/${invoice.owner_id}/profile`} className="text-emerald-600 hover:text-emerald-700 font-bold">
                          {invoice.owner_name || 'View Profile'}
                        </Link>
                      ) : (
                        invoice.owner_name || 'N/A'
                      )}
                    </p>
                    <p className="text-sm font-extrabold text-slate-700">{invoice.amount} BDT</p>
                    <p className="text-xs text-slate-400">Due Date: {new Date(invoice.due_date).toLocaleDateString()}</p>
                    {invoice.payment_method && (
                      <div className="flex gap-4 text-xs font-semibold text-slate-500">
                        <span>Method: {invoice.payment_method}</span>
                        <span>Txn: {invoice.transaction_id}</span>
                        <span>Paid: {new Date(invoice.updated_at).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                  {invoice.status === 'pending' && (
                    <Button variant="primary" size="sm" onClick={() => startCheckout(invoice)} className="shrink-0">
                      <CreditCard className="w-4 h-4 mr-1.5" /> Pay Now
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 5. VERIFICATION TAB */}
      {activeTab === 'verification' && (
        <div className="max-w-2xl bg-white border border-slate-200 p-6 sm:p-8 rounded-2xl shadow-sm space-y-6">
          <h2 className="text-xl font-bold text-slate-800">Document Verification</h2>
          
          {/* Status Panel */}
          {verificationRes?.data && verificationRes.data.status !== 'unverified' ? (
            <div className={`p-4 rounded-xl border flex items-start gap-3 ${
              verificationRes.data.status === 'approved' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' :
              verificationRes.data.status === 'rejected' ? 'bg-red-50 border-red-100 text-red-800' : 'bg-amber-50 border-amber-100 text-amber-800'
            }`}>
              <Shield className="w-5 h-5 mt-0.5 shrink-0" />
              <div>
                <h4 className="font-extrabold text-sm capitalize">Verification Status: {verificationRes.data.status}</h4>
                {verificationRes.data.created_at && (
                  <p className="text-xs mt-1">Submitted: {new Date(verificationRes.data.created_at).toLocaleDateString()}</p>
                )}
                {verificationRes.data.rejection_reason && (
                  <p className="text-xs mt-2 bg-white/70 p-2 rounded border border-red-100 font-semibold italic">
                    Reason for rejection: {verificationRes.data.rejection_reason}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl text-slate-500 text-xs flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-500" />
              <span>You haven't submitted tenant verification documents yet. Upload your National ID (NID) or Student ID to verify your identity.</span>
            </div>
          )}

          {/* Upload Form */}
          {(!verificationRes?.data || ['unverified', 'rejected'].includes(verificationRes.data.status)) && (
            <form onSubmit={handleVerificationSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-400 uppercase">Tenant Document Type</label>
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl p-2.5 bg-slate-50 text-slate-700 text-sm focus:outline-none"
                >
                  <option value="nid">National ID (NID)</option>
                  <option value="student_id">Student ID</option>
                </select>
              </div>

              {/* Drag and Drop */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-400 uppercase">Upload NID / Student ID File (PDF/Image)</label>
                <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center hover:bg-slate-50 transition-colors relative cursor-pointer">
                  <input
                    type="file"
                    required
                    accept=".pdf,image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <div className="space-y-2">
                    <Upload className="w-8 h-8 text-slate-350 mx-auto" />
                    {selectedFile ? (
                      <p className="text-sm font-bold text-slate-800">{selectedFile.name}</p>
                    ) : (
                      <>
                        <p className="text-sm font-semibold text-slate-500">Drag & drop file here, or click to browse</p>
                        <p className="text-xs text-slate-400">Supported formats: JPEG, PNG, PDF (Max 5MB)</p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                loading={submitVerificationMutation.isPending}
                className="py-2.5 px-6 rounded-xl font-bold"
              >
                Submit Tenant Verification
              </Button>
            </form>
          )}
        </div>
      )}

      {/* Mock payment Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-zoomIn border border-slate-100">
            {/* Header */}
            <div className="p-6 bg-slate-50 border-b border-slate-150 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-slate-800 text-lg">Secure Payment Portal</h3>
                <p className="text-xs text-slate-400">Pay invoice amount via Bangladeshi wallet</p>
              </div>
              <button 
                onClick={() => setSelectedInvoice(null)} 
                className="text-slate-400 hover:text-slate-600 bg-white p-1 rounded-full border border-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Wallet Selector */}
            <div className="p-6 space-y-6">
              {payStep === 1 && (
                <div className="space-y-4">
                  <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100 flex justify-between items-center text-sm">
                    <span className="text-slate-500 font-medium">Payable Amount:</span>
                    <span className="text-base font-extrabold text-emerald-600 font-display">{selectedInvoice.amount} BDT</span>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-400 uppercase">Select Mobile Wallet</label>
                    <div className="grid grid-cols-2 gap-3">
                      {['bKash', 'Nagad'].map((wallet) => (
                        <button
                          key={wallet}
                          type="button"
                          onClick={() => setPaymentMethod(wallet)}
                          className={`p-4 border-2 rounded-xl transition-all flex flex-col items-center justify-center font-bold focus:outline-none ${
                            paymentMethod === wallet
                              ? 'border-pink-500 bg-pink-50/10 text-pink-700' // bKash/Nagad highlight
                              : 'border-slate-100 hover:border-slate-200 text-slate-500'
                          }`}
                        >
                          <span className="text-sm font-extrabold">{wallet}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-400 uppercase">Wallet Phone Number</label>
                    <input
                      type="text"
                      placeholder="e.g. 01700000000"
                      value={payPhone}
                      onChange={(e) => setPayPhone(e.target.value.replace(/\D/g, ''))}
                      className="w-full border border-slate-200 rounded-xl p-3 bg-slate-50 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                    />
                  </div>
                </div>
              )}

              {/* Step 2: Mock OTP */}
              {payStep === 2 && (
                <div className="space-y-4 text-center">
                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-100 text-xs text-amber-700 font-semibold">
                    We sent a simulated 6-digit OTP code to {payPhone}. Enter 123456 to continue.
                  </div>
                  <div className="space-y-1.5 text-left">
                    <label className="block text-xs font-bold text-slate-400 uppercase">OTP Verification Code</label>
                    <input
                      type="text"
                      placeholder="Enter 123456"
                      value={payOtp}
                      onChange={(e) => setPayOtp(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl p-3 bg-slate-50 text-slate-700 text-center text-lg font-bold tracking-widest focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                    />
                  </div>
                </div>
              )}

              {/* Step 3: Mock PIN */}
              {payStep === 3 && (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-400 uppercase">Enter Account PIN</label>
                    <input
                      type="password"
                      placeholder="••••"
                      maxLength={4}
                      value={payPin}
                      onChange={(e) => setPayPin(e.target.value.replace(/\D/g, ''))}
                      className="w-full border border-slate-200 rounded-xl p-3 bg-slate-50 text-slate-700 text-center text-lg font-bold tracking-widest focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                    />
                  </div>
                </div>
              )}

              {/* Footer navigation */}
              <div className="flex gap-3 justify-end pt-2 border-t border-slate-100">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    if (payStep > 1) setPayStep(payStep - 1);
                    else setSelectedInvoice(null);
                  }}
                >
                  {payStep > 1 ? 'Back' : 'Cancel'}
                </Button>
                <Button 
                  variant="primary" 
                  onClick={handlePaymentNext}
                  loading={processPaymentMutation.isPending}
                >
                  {payStep === 3 ? 'Confirm Payment' : 'Next'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

    </DashboardLayout>
  );
};

export default TenantDashboard;
