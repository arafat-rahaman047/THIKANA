import React, { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  Home, FileText, CreditCard, MessageSquare, ShieldCheck, 
  Plus, Edit, Trash, Check, X, Clock, Upload, Send, Shield 
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Button from '../../components/common/Button';
import { useNotification } from '../../context/NotificationContext';
import useAuth from '../../hooks/useAuth';
import { getMediaUrl } from '../../utils/mediaUrl';
import { getProperties, getPropertyById, createProperty, updateProperty, deleteProperty } from '../../services/propertyService';
import { listAgreements, listAgreementCandidates, createAgreement } from '../../services/agreementService';
import { listPayments, createMockPayment } from '../../services/paymentService';
import { listConversations, getMessages, sendMessage } from '../../services/messageService';
import { getVerificationStatus, submitVerification } from '../../services/verificationService';

const PROPERTY_TYPES = [
  { id: 1, name: 'Apartment' },
  { id: 2, name: 'House' },
  { id: 3, name: 'Sublet' },
  { id: 4, name: 'Office' },
  { id: 5, name: 'Bachelor Mess' }
];

const ZONES = [
  { id: 1, name: 'Gulshan', city: 'Dhaka' },
  { id: 2, name: 'Banani', city: 'Dhaka' },
  { id: 3, name: 'Dhanmondi', city: 'Dhaka' },
  { id: 4, name: 'Uttara', city: 'Dhaka' },
  { id: 5, name: 'Mirpur', city: 'Dhaka' },
  { id: 6, name: 'Halishahar', city: 'Chittagong' },
  { id: 7, name: 'GEC Circle', city: 'Chittagong' }
];

const AMENITIES = [
  { id: 1, name: 'Lift' },
  { id: 2, name: 'Generator' },
  { id: 3, name: 'Security' },
  { id: 4, name: 'WiFi' },
  { id: 5, name: 'Parking' },
  { id: 6, name: 'Gas' },
  { id: 7, name: 'CCTV' },
  { id: 8, name: 'Balcony' },
  { id: 9, name: 'Gym' }
];

const OWNER_VERIFICATION_DOCUMENTS = [
  { value: 'property_deed', label: 'Property Ownership Deed / Sale Deed' },
  { value: 'mutation_certificate', label: 'Mutation Certificate / Khatian' },
  { value: 'tax_receipt', label: 'Latest Property Tax / Holding Tax Receipt' },
  { value: 'utility_bill', label: 'Recent Utility Bill for the Property' }
];

const OwnerDashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'listings';
  const { showNotification } = useNotification();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Modal Toggles
  const [showCreateModal, setShowCreateModal] = useState(false);
const [editingProperty, setEditingProperty] = useState(null);
const [existingMedia, setExistingMedia] = useState([]);
  const [showAgreementModal, setShowAgreementModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  // Chat State
  const [selectedChat, setSelectedChat] = useState(null);
  const [chatText, setChatText] = useState('');

  // Property Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [bedrooms, setBedrooms] = useState('');
  const [bathrooms, setBathrooms] = useState('');
  const [areaSqft, setAreaSqft] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Dhaka');
  const [typeId, setTypeId] = useState(1);
  const [zoneId, setZoneId] = useState(1);
  const [listingType, setListingType] = useState('rent');
  const [isFurnished, setIsFurnished] = useState(0);
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [propertyFiles, setPropertyFiles] = useState([]);

  // Agreement Form State
  const [selectedAgreementCandidate, setSelectedAgreementCandidate] = useState('');
  const [agRent, setAgRent] = useState('');
  const [agDeposit, setAgDeposit] = useState('');
  const [agStartDate, setAgStartDate] = useState('');
  const [agEndDate, setAgEndDate] = useState('');
  const [agTerms, setAgTerms] = useState('');

  // Invoice Form State
  const [invAgreementId, setInvAgreementId] = useState('');
  const [invAmount, setInvAmount] = useState('');
  const [invDueDate, setInvDueDate] = useState('');

  // Verification State
  const [docType, setDocType] = useState('property_deed');
  const [selectedFile, setSelectedFile] = useState(null);

  // Set active tab in search params
  const setActiveTab = (tabId) => {
    setSearchParams({ tab: tabId });
  };

  // Queries
const { data: propertiesRes, isLoading: listingsLoading } = useQuery({
  queryKey: ['owner-properties', user?.id],
  queryFn: () => getProperties({ ownerId: user?.id, status: 'all' }),
  enabled: activeTab === 'listings' && !!user?.id
});

  const { data: agreementsRes, isLoading: agreementsLoading } = useQuery({
    queryKey: ['owner-agreements'],
    queryFn: listAgreements,
    enabled: ['agreements', 'payments'].includes(activeTab)
  });

  const {
    data: agreementCandidatesRes,
    isLoading: agreementCandidatesLoading,
    isError: agreementCandidatesIsError,
    error: agreementCandidatesError,
    refetch: refetchAgreementCandidates
  } = useQuery({
    queryKey: ['agreement-candidates', user?.id],
    queryFn: listAgreementCandidates,
    enabled: activeTab === 'agreements' && !!user?.id,
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true
  });

  const { data: paymentsRes, isLoading: paymentsLoading } = useQuery({
    queryKey: ['owner-payments'],
    queryFn: listPayments,
    enabled: activeTab === 'payments'
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
    refetchInterval: 3000
  });

  const { data: verificationRes, refetch: refetchVerification } = useQuery({
    queryKey: ['verification-status'],
    queryFn: getVerificationStatus,
    enabled: activeTab === 'verification'
  });

  const agreements = agreementsRes?.data || [];
  const agreementCandidates = agreementCandidatesRes?.data || [];
  const isAgreementCandidateEligible = (candidate) => {
    return candidate?.can_create_agreement === undefined || Number(candidate.can_create_agreement) === 1;
  };
  const eligibleAgreementCandidates = agreementCandidates.filter(isAgreementCandidateEligible);
  const hasAgreementCandidates = agreementCandidates.length > 0;
  const hasEligibleAgreementCandidates = eligibleAgreementCandidates.length > 0;
  const getAgreementCandidateValue = (candidate) => String(candidate?.conversation_id || `${candidate?.property_id}:${candidate?.tenant_id}`);
  const invoiceableAgreements = agreements.filter((agreement) => agreement.status === 'accepted');
  const conversations = chatsRes?.data || [];
  const selectedConversation = conversations.find((chat) => String(chat.conversation_id) === String(selectedChat));

  useEffect(() => {
    const chatFromUrl = searchParams.get('chat');

    if (activeTab !== 'messages' || !chatFromUrl || conversations.length === 0) {
      return;
    }

    const chatExists = conversations.some((chat) => String(chat.conversation_id) === String(chatFromUrl));
    if (chatExists && String(selectedChat) !== String(chatFromUrl)) {
      setSelectedChat(Number(chatFromUrl));
    }
  }, [activeTab, conversations, searchParams, selectedChat]);

  useEffect(() => {
    if (showAgreementModal && activeTab === 'agreements') {
      refetchAgreementCandidates();
    }
  }, [showAgreementModal, activeTab, refetchAgreementCandidates]);

  // Mutations
  const createPropertyMutation = useMutation({
    mutationFn: (formData) => createProperty(formData),
    onSuccess: () => {
      setShowCreateModal(false);
      resetPropertyForm();
      queryClient.invalidateQueries({ queryKey: ['owner-properties'] });
      showNotification('Property listing created successfully. Pending admin review.', 'success');
    },
    onError: (err) => {
      showNotification(err.message || 'Failed to create listing', 'error');
    }

  });

  const updatePropertyMutation = useMutation({
  mutationFn: ({ id, formData }) => updateProperty(id, formData),
  onSuccess: () => {
    setShowCreateModal(false);
    resetPropertyForm();
    queryClient.invalidateQueries({ queryKey: ['owner-properties'] });
    showNotification('Property listing updated successfully.', 'success');
  },
  onError: (err) => {
    showNotification(err.message || 'Failed to update listing', 'error');
  }
});

  const deletePropertyMutation = useMutation({
    mutationFn: (id) => deleteProperty(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['owner-properties'] });
      showNotification('Property listing deleted', 'success');
    },
    onError: (err) => {
      showNotification(err.message || 'Failed to delete listing', 'error');
    }
  });

  const createAgreementMutation = useMutation({
    mutationFn: (data) => createAgreement(data),
    onSuccess: () => {
      setShowAgreementModal(false);
      resetAgreementForm();
      queryClient.invalidateQueries({ queryKey: ['owner-agreements'] });
      queryClient.invalidateQueries({ queryKey: ['agreement-candidates'] });
      showNotification('Agreement drafted successfully and sent to tenant.', 'success');
    },
    onError: (err) => {
      showNotification(err.message || 'Failed to draft agreement', 'error');
    }
  });

  const createInvoiceMutation = useMutation({
    mutationFn: (data) => createMockPayment(data),
    onSuccess: () => {
      setShowInvoiceModal(false);
      setInvAgreementId('');
      setInvAmount('');
      setInvDueDate('');
      queryClient.invalidateQueries({ queryKey: ['owner-payments'] });
      showNotification('Payment invoice generated successfully.', 'success');
    },
    onError: (err) => {
      showNotification(err.message || 'Failed to generate invoice', 'error');
    }
  });

  const sendMessageMutation = useMutation({
    mutationFn: () => sendMessage(selectedChat, chatText),
    onSuccess: () => {
      setChatText('');
      refetchMessages();
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['agreement-candidates'] });
    },
    onError: (err) => {
      showNotification(err.message || 'Failed to send message', 'error');
    }
  });

  const submitVerificationMutation = useMutation({
    mutationFn: (formData) => submitVerification(formData),
    onSuccess: () => {
      setSelectedFile(null);
      refetchVerification();
      showNotification(user?.role === 'agency' ? 'Trade license submitted successfully for review.' : 'Property document submitted successfully for review.', 'success');
    },
    onError: (err) => {
      showNotification(err.message || 'Failed to submit verification document', 'error');
    }
  });

  // Handlers
  const handleAmenityToggle = (amenityId) => {
    setSelectedAmenities(prev => 
      prev.includes(amenityId) 
        ? prev.filter(id => id !== amenityId)
        : [...prev, amenityId]
    );
  };

  const handlePropertyFilesChange = (e) => {
    if (e.target.files) {
      setPropertyFiles(Array.from(e.target.files));
    }
  };

  const resetPropertyForm = () => {
    setTitle('');
    setDescription('');
    setPrice('');
    setBedrooms('');
    setBathrooms('');
    setAreaSqft('');
    setAddress('');
    setCity('Dhaka');
    setTypeId(1);
    setZoneId(1);
    setListingType('rent');
    setIsFurnished(0);
    setSelectedAmenities([]);
    setPropertyFiles([]);
    setEditingProperty(null);
    setExistingMedia([]);
  };

  const openCreatePropertyModal = () => {
  resetPropertyForm();
  setShowCreateModal(true);
};

const openEditPropertyModal = async (prop) => {
  try {
    const detailsRes = await getPropertyById(prop.id);
    const property = detailsRes?.data || prop;

    setEditingProperty(property);
    setTitle(property.title || '');
    setDescription(property.description || '');
    setPrice(property.price || '');
    setBedrooms(property.bedrooms ?? '');
    setBathrooms(property.bathrooms ?? '');
    setAreaSqft(property.area_sqft || '');
    setAddress(property.address || '');
    setCity(property.city || 'Dhaka');
    setTypeId(property.type_id || prop.type_id || 1);
    setZoneId(property.zone_id || prop.zone_id || 1);
    setListingType(property.listing_type || 'rent');
    setIsFurnished(property.is_furnished ? 1 : 0);
    setSelectedAmenities((property.amenities || []).map((am) => am.id));
    setExistingMedia(property.media || []);
    setPropertyFiles([]);
    setShowCreateModal(true);
  } catch (err) {
    showNotification(err.message || 'Failed to load listing details for editing', 'error');
  }
};

  const resetAgreementForm = () => {
    setSelectedAgreementCandidate('');
    setAgRent('');
    setAgDeposit('');
    setAgStartDate('');
    setAgEndDate('');
    setAgTerms('');
  };

  const openAgreementModal = () => {
    resetAgreementForm();
    queryClient.invalidateQueries({ queryKey: ['agreement-candidates'] });
    refetchAgreementCandidates();
    setShowAgreementModal(true);
  };

  const handleCreatePropertySubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('price', price);
    formData.append('bedrooms', bedrooms);
    formData.append('bathrooms', bathrooms);
    formData.append('areaSqft', areaSqft);
    formData.append('address', address);
    formData.append('city', city);
    formData.append('typeId', typeId);
    formData.append('zoneId', zoneId);
    formData.append('listingType', listingType);
    formData.append('isFurnished', isFurnished);
    
    // Add amenities
    selectedAmenities.forEach(id => {
      formData.append('amenities', id);
    });

    // Add files
    propertyFiles.forEach(file => {
      formData.append('images', file);
    });
    if (editingProperty) {
        updatePropertyMutation.mutate({ id: editingProperty.id, formData });
      } else {
        createPropertyMutation.mutate(formData);
      }
  };

  const handleAgreementCandidateChange = (value) => {
    setSelectedAgreementCandidate(value);

    const selectedCandidate = agreementCandidates.find((candidate) => {
      return getAgreementCandidateValue(candidate) === value;
    });

    if (selectedCandidate?.property_price) {
      setAgRent(String(selectedCandidate.property_price));
    }
  };

  const handleInvoiceAgreementChange = (agreementId) => {
    setInvAgreementId(agreementId);
    const selectedAgreement = invoiceableAgreements.find((agreement) => String(agreement.id) === String(agreementId));

    if (selectedAgreement?.rent_amount) {
      setInvAmount(String(selectedAgreement.rent_amount));
    }
  };

  const openInvoiceModal = () => {
    const firstAcceptedAgreement = invoiceableAgreements[0];

    if (firstAcceptedAgreement) {
      setInvAgreementId(String(firstAcceptedAgreement.id));
      setInvAmount(String(firstAcceptedAgreement.rent_amount));
    } else {
      setInvAgreementId('');
      setInvAmount('');
    }

    setShowInvoiceModal(true);
  };

  const handleAgreementSubmit = (e) => {
    e.preventDefault();

    const selectedCandidate = agreementCandidates.find((candidate) => {
      return getAgreementCandidateValue(candidate) === selectedAgreementCandidate;
    });

    if (!selectedCandidate || !isAgreementCandidateEligible(selectedCandidate)) {
      showNotification('Please select an eligible tenant conversation for this agreement.', 'warning');
      return;
    }

    createAgreementMutation.mutate({
      propertyId: Number(selectedCandidate.property_id),
      tenantId: Number(selectedCandidate.tenant_id),
      rentAmount: parseFloat(agRent),
      securityDeposit: parseFloat(agDeposit),
      startDate: agStartDate,
      endDate: agEndDate,
      terms: agTerms
    });
  };

  const handleInvoiceSubmit = (e) => {
    e.preventDefault();

    const selectedAgreement = invoiceableAgreements.find((agreement) => String(agreement.id) === String(invAgreementId));

    if (!selectedAgreement) {
      showNotification('Please select an accepted rental agreement first.', 'warning');
      return;
    }

    createInvoiceMutation.mutate({
      agreementId: Number(selectedAgreement.id),
      amount: parseFloat(invAmount),
      dueDate: invDueDate
    });
  };

  const handleSendChat = (e) => {
    e.preventDefault();
    if (!chatText.trim()) return;
    sendMessageMutation.mutate();
  };

  const handleVerificationSubmit = (e) => {
    e.preventDefault();
    if (!selectedFile) {
      showNotification(user?.role === 'agency' ? 'Please select a Trade License file to upload' : 'Please select a property-related document to upload', 'warning');
      return;
    }

    const verificationDocumentType = user?.role === 'agency' ? 'trade_license' : docType;

    const formData = new FormData();
    formData.append('documentType', verificationDocumentType);
    formData.append('document', selectedFile);
    submitVerificationMutation.mutate(formData);
  };

  const tabs = [
    { id: 'listings', label: 'Property Listings', icon: Home },
    { id: 'agreements', label: 'Rental Agreements', icon: FileText },
    { id: 'payments', label: 'Payments Ledger', icon: CreditCard },
    { id: 'messages', label: 'Conversations', icon: MessageSquare },
    { id: 'verification', label: 'Verification', icon: ShieldCheck }
  ];

  const filteredZones = ZONES.filter(z => z.city.toLowerCase() === city.toLowerCase());

  return (
    <DashboardLayout
      title="Owner Dashboard"
      tabs={tabs}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
    >
      {/* 1. PROPERTY LISTINGS TAB */}
      {activeTab === 'listings' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-slate-800">My Listings</h2>
            <Button variant="primary" size="sm" onClick={openCreatePropertyModal}>
              <Plus className="w-4 h-4 mr-1.5" /> List New Property
            </Button>
          </div>

          {listingsLoading ? (
            <div className="text-center py-12">Loading property list...</div>
          ) : !propertiesRes?.data || propertiesRes.data.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-slate-100 text-slate-400">
              You haven't listed any properties yet. Click the button above to add one.
            </div>
          ) : (
            <div className="space-y-4">
              {propertiesRes.data.map((prop) => (
                <div key={prop.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                  <div className="flex gap-4 items-start">
                    <img
                      src={getMediaUrl(prop.thumbnail_url)}
                      alt=""
                      className="w-20 h-20 rounded-xl object-cover border bg-slate-50 shrink-0"
                    />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-extrabold text-slate-800">{prop.title}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded capitalize ${
                          prop.status === 'active' ? 'bg-emerald-100 text-emerald-800' :
                          prop.status === 'pending' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {prop.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-455 font-bold uppercase tracking-wider">{prop.address}, {prop.city}</p>
                      <p className="text-sm font-extrabold text-emerald-600">{prop.price} BDT/mo</p>
                      <div className="flex gap-3 text-xs text-slate-400">
                        <span>{prop.bedrooms} Beds</span>
                        <span>•</span>
                        <span>{prop.bathrooms} Baths</span>
                        <span>•</span>
                        <span>{prop.area_sqft} sqft</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 self-end sm:self-auto shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditPropertyModal(prop)}
                      className="text-emerald-600 border-emerald-100 hover:bg-emerald-50"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deletePropertyMutation.mutate(prop.id)}
                      loading={deletePropertyMutation.isPending}
                      className="text-red-500 border-red-100 hover:bg-red-50"
                    >
                      <Trash className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 2. RENTAL AGREEMENTS TAB */}
      {activeTab === 'agreements' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-slate-800">Drafted Agreements</h2>
            <Button variant="primary" size="sm" onClick={openAgreementModal}>
              <Plus className="w-4 h-4 mr-1.5" /> Draft New Agreement
            </Button>
          </div>

          {agreementsLoading ? (
            <div className="text-center py-12">Loading agreements...</div>
          ) : !agreementsRes?.data || agreementsRes.data.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-slate-100 text-slate-400">
              No agreements drafted yet.
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
                    <p className="text-sm font-bold text-slate-700">
                      {ag.property_title} • Tenant:{' '}
                      {ag.tenant_id ? (
                        <Link to={`/users/${ag.tenant_id}/profile`} className="text-emerald-600 hover:text-emerald-700 font-extrabold">
                          {ag.tenant_name || ag.tenant_email || 'View Profile'}
                        </Link>
                      ) : (
                        ag.tenant_name || ag.tenant_email || 'Tenant'
                      )}
                    </p>
                    <p className="text-xs text-slate-400">
                      Duration: {new Date(ag.start_date).toLocaleDateString()} to {new Date(ag.end_date).toLocaleDateString()}
                    </p>
                    <div className="flex gap-4 text-xs font-semibold text-slate-500">
                      <span>Rent: {ag.rent_amount} BDT</span>
                      <span>Deposit: {ag.security_deposit} BDT</span>
                    </div>
                    {ag.terms && <p className="text-xs text-slate-400 italic">Terms: {ag.terms}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 3. PAYMENTS LEDGER TAB */}
      {activeTab === 'payments' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-slate-800">Payments Ledger</h2>
            <Button variant="primary" size="sm" onClick={openInvoiceModal}>
              <Plus className="w-4 h-4 mr-1.5" /> Generate Invoice
            </Button>
          </div>

          {paymentsLoading ? (
            <div className="text-center py-12">Loading payments ledger...</div>
          ) : !paymentsRes?.data || paymentsRes.data.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-slate-100 text-slate-400">
              No payment ledger data.
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
                    <p className="text-sm font-bold text-slate-700">
                      Agreement #{invoice.agreement_id} • {invoice.property_title} • Tenant:{' '}
                      {invoice.tenant_id ? (
                        <Link to={`/users/${invoice.tenant_id}/profile`} className="text-emerald-600 hover:text-emerald-700 font-extrabold">
                          {invoice.tenant_name || 'View Profile'}
                        </Link>
                      ) : (
                        invoice.tenant_name || 'Tenant'
                      )}
                    </p>
                    <p className="text-base font-extrabold text-emerald-600 font-display">{invoice.amount} BDT</p>
                    <p className="text-xs text-slate-450">Due Date: {new Date(invoice.due_date).toLocaleDateString()}</p>
                    {invoice.payment_method && (
                      <div className="flex gap-4 text-xs font-semibold text-slate-500">
                        <span>Method: {invoice.payment_method}</span>
                        <span>Txn ID: {invoice.transaction_id}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 4. MESSAGES TAB */}
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
                      src={`https://api.dicebear.com/7.x/identicon/svg?seed=${chat.other_user_name || chat.other_user_email || 'user'}`}
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

      {/* 5. VERIFICATION TAB */}
      {activeTab === 'verification' && (
        <div className="max-w-2xl bg-white border border-slate-200 p-6 sm:p-8 rounded-2xl shadow-sm space-y-6">
          <h2 className="text-xl font-bold text-slate-800">{user?.role === 'agency' ? 'Trade License Submission' : 'Property Ownership Verification'}</h2>
          
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
              <span>{user?.role === 'agency' ? 'You have not submitted agency verification documents yet. Submit your Agency Trade License for verification.' : 'You have not submitted owner verification documents yet. Submit property-related paper to prove property ownership.'}</span>
            </div>
          )}

          {(!verificationRes?.data || ['unverified', 'rejected'].includes(verificationRes.data.status)) && (
            <form onSubmit={handleVerificationSubmit} className="space-y-4">
              {user?.role !== 'agency' && (
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-400 uppercase">Owner Property Document Type</label>
                  <select
                    value={docType}
                    onChange={(e) => setDocType(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl p-2.5 bg-slate-50 text-slate-700 text-sm focus:outline-none"
                  >
                    {OWNER_VERIFICATION_DOCUMENTS.map((doc) => (
                      <option key={doc.value} value={doc.value}>{doc.label}</option>
                    ))}
                  </select>
                  <p className="text-xs text-slate-400">Upload a paper that proves your ownership or legal connection with the property.</p>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-400 uppercase">{user?.role === 'agency' ? 'Upload Trade License File (Image/PDF)' : 'Upload Property Paper File (Image/PDF)'}</label>
                <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center hover:bg-slate-50 transition-colors relative cursor-pointer">
                  <input
                    type="file"
                    required
                    accept=".pdf,image/*"
                    onChange={(e) => setSelectedFile(e.target.files ? e.target.files[0] : null)}
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
                {user?.role === 'agency' ? 'Submit Trade License' : 'Submit Property Document'}
              </Button>
            </form>
          )}
        </div>
      )}

      {/* CREATE PROPERTY LISTING MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl my-8 overflow-hidden animate-zoomIn border border-slate-100 flex flex-col max-h-[90vh]">
            <div className="p-6 bg-slate-50 border-b border-slate-150 flex items-center justify-between shrink-0">
              <h3 className="font-extrabold text-slate-800 text-lg">
                {editingProperty ? 'Edit Property Listing' : 'List New Property'}
              </h3>
              <button onClick={() => { setShowCreateModal(false); resetPropertyForm(); }} className="text-slate-400 hover:text-slate-600 bg-white p-1 rounded-full border border-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePropertySubmit} className="p-6 space-y-6 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2 space-y-1">
                  <label className="block text-xs font-bold text-slate-450 uppercase">Property Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 3 BHK Premium Flat in Gulshan"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl p-2.5 bg-slate-50 text-slate-700 text-sm focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="block text-xs font-bold text-slate-450 uppercase">Description *</label>
                  <textarea
                    required
                    rows="3"
                    placeholder="Provide details about rooms, view, floor level, utilities and landlord expectations..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl p-2.5 bg-slate-50 text-slate-700 text-sm focus:outline-none"
                  ></textarea>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-450 uppercase">Rent/Price (BDT/mo) *</label>
                  <input
                    type="number"
                    required
                    placeholder="Rent amount"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl p-2.5 bg-slate-50 text-slate-700 text-sm focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-450 uppercase">Area Size (sqft) *</label>
                  <input
                    type="number"
                    required
                    placeholder="Area size"
                    value={areaSqft}
                    onChange={(e) => setAreaSqft(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl p-2.5 bg-slate-50 text-slate-700 text-sm focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-450 uppercase">Beds *</label>
                    <input
                      type="number"
                      required
                      placeholder="Bedrooms"
                      value={bedrooms}
                      onChange={(e) => setBedrooms(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl p-2.5 bg-slate-50 text-slate-700 text-sm focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-450 uppercase">Baths *</label>
                    <input
                      type="number"
                      required
                      placeholder="Bathrooms"
                      value={bathrooms}
                      onChange={(e) => setBathrooms(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl p-2.5 bg-slate-50 text-slate-700 text-sm focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-455 uppercase">Listing Type *</label>
                  <select
                    value={listingType}
                    onChange={(e) => setListingType(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl p-2.5 bg-slate-50 text-slate-700 text-sm focus:outline-none"
                  >
                    <option value="rent">Rent</option>
                    <option value="sale">Sale</option>
                    <option value="sublet">Sublet</option>
                    <option value="office">Office</option>
                    <option value="bachelor">Bachelor Mess</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-455 uppercase">City *</label>
                  <select
                    value={city}
                    onChange={(e) => {
                      setCity(e.target.value);
                      setZoneId(e.target.value === 'Dhaka' ? 1 : 6);
                    }}
                    className="w-full border border-slate-200 rounded-xl p-2.5 bg-slate-50 text-slate-700 text-sm focus:outline-none"
                  >
                    <option value="Dhaka">Dhaka</option>
                    <option value="Chittagong">Chittagong</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-455 uppercase">Zone / Area *</label>
                  <select
                    value={zoneId}
                    onChange={(e) => setZoneId(parseInt(e.target.value, 10))}
                    className="w-full border border-slate-200 rounded-xl p-2.5 bg-slate-50 text-slate-700 text-sm focus:outline-none"
                  >
                    {filteredZones.map(z => (
                      <option key={z.id} value={z.id}>{z.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-455 uppercase">Property Type *</label>
                  <select
                    value={typeId}
                    onChange={(e) => setTypeId(parseInt(e.target.value, 10))}
                    className="w-full border border-slate-200 rounded-xl p-2.5 bg-slate-50 text-slate-700 text-sm focus:outline-none"
                  >
                    {PROPERTY_TYPES.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-455 uppercase">Furnishing *</label>
                  <select
                    value={isFurnished}
                    onChange={(e) => setIsFurnished(parseInt(e.target.value, 10))}
                    className="w-full border border-slate-200 rounded-xl p-2.5 bg-slate-50 text-slate-700 text-sm focus:outline-none"
                  >
                    <option value="0">Unfurnished</option>
                    <option value="1">Furnished</option>
                  </select>
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="block text-xs font-bold text-slate-450 uppercase">Address *</label>
                  <input
                    type="text"
                    required
                    placeholder="Full street address (e.g. Flat 4A, House 12, Road 5, Gulshan 1)"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl p-2.5 bg-slate-50 text-slate-700 text-sm focus:outline-none"
                  />
                </div>

                {/* Upload media */}
                <div className="sm:col-span-2 space-y-1">
                  <label className="block text-xs font-bold text-slate-450 uppercase">
                    Property Photos (Up to 10 files) {editingProperty ? '(optional: add more)' : '*'}
                  </label>
                  <div className="border border-dashed border-slate-200 rounded-xl p-4 bg-slate-50 flex items-center justify-between text-xs text-slate-400">
                    <input
                      type="file"
                     required={!editingProperty}
                      multiple
                      accept="image/*"
                      onChange={handlePropertyFilesChange}
                      className="text-slate-500 font-semibold"
                    />
                    <span>{propertyFiles.length} file(s) selected</span>
                  </div>
                </div>

                {editingProperty && existingMedia.length > 0 && (
                  <div className="flex gap-2 overflow-x-auto pt-2">
                    {existingMedia.map((media, idx) => (
                      <div key={media.id || idx} className="relative w-20 h-16 rounded-lg overflow-hidden border border-slate-100 shrink-0">
                        <img
                          src={getMediaUrl(media.url)}
                          alt="Existing property"
                          className="w-full h-full object-cover"
                        />
                        {media.is_thumbnail ? (
                          <span className="absolute left-1 bottom-1 text-[9px] bg-emerald-600 text-white px-1.5 py-0.5 rounded">
                            Thumbnail
                          </span>
                        ) : null}
                      </div>
                    ))}
                  </div>
                )}

                {/* Amenities checklists */}
                <div className="sm:col-span-2 space-y-2 pt-2">
                  <label className="block text-xs font-bold text-slate-450 uppercase mb-2">Amenities</label>
                  <div className="grid grid-cols-3 gap-2">
                    {AMENITIES.map((am) => (
                      <button
                        key={am.id}
                        type="button"
                        onClick={() => handleAmenityToggle(am.id)}
                        className={`p-2 border text-left rounded-lg text-xs font-semibold transition-all ${
                          selectedAmenities.includes(am.id)
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                            : 'border-slate-100 hover:border-slate-200 text-slate-500'
                        }`}
                      >
                        {am.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-slate-100 shrink-0">
                <Button variant="outline" onClick={() => { setShowCreateModal(false); resetPropertyForm(); }}>
                  Cancel
                </Button>
               <Button
                type="submit"
                variant="primary"
                loading={createPropertyMutation.isPending || updatePropertyMutation.isPending}
              >
                {editingProperty ? 'Save Changes' : 'Submit Listing'}
              </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DRAFT AGREEMENT MODAL */}
      {showAgreementModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-zoomIn border border-slate-100">
            <div className="p-6 bg-slate-50 border-b border-slate-150 flex items-center justify-between">
              <h3 className="font-extrabold text-slate-800 text-lg">Draft Rental Agreement</h3>
              <button onClick={() => setShowAgreementModal(false)} className="text-slate-400 hover:text-slate-600 bg-white p-1 rounded-full border border-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAgreementSubmit} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-400 uppercase">Tenant & Property *</label>
                <select
                  required
                  value={selectedAgreementCandidate}
                  onChange={(e) => handleAgreementCandidateChange(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl p-2.5 bg-slate-50 text-slate-700 text-sm focus:outline-none"
                  disabled={agreementCandidatesLoading || !hasEligibleAgreementCandidates}
                >
                  <option value="">
                    {agreementCandidatesLoading ? 'Loading conversations...' : 'Select tenant conversation'}
                  </option>
                  {agreementCandidates.map((candidate) => {
                    const isEligible = isAgreementCandidateEligible(candidate);
                    return (
                      <option
                        key={getAgreementCandidateValue(candidate)}
                        value={getAgreementCandidateValue(candidate)}
                        disabled={!isEligible}
                      >
                        {candidate.property_title} — {candidate.tenant_name || candidate.tenant_email || candidate.tenant_phone}
                        {!isEligible ? ` — active agreement: ${candidate.existing_agreement_status}` : ''}
                      </option>
                    );
                  })}
                </select>
                {agreementCandidatesIsError && !agreementCandidatesLoading && (
                  <p className="text-xs text-red-600 font-semibold mt-1">
                    Could not load tenant conversations: {agreementCandidatesError?.message || 'Please check backend console.'}
                  </p>
                )}
                {!agreementCandidatesIsError && !hasAgreementCandidates && !agreementCandidatesLoading && (
                  <p className="text-xs text-amber-600 font-semibold mt-1">
                    No tenant conversation found. Ask the tenant to message you from that property first.
                  </p>
                )}
                {hasAgreementCandidates && !hasEligibleAgreementCandidates && !agreementCandidatesLoading && (
                  <p className="text-xs text-amber-600 font-semibold mt-1">
                    Tenant conversation found, but an active agreement already exists for it. Check the agreement list below.
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-400 uppercase">Rent Amount *</label>
                  <input
                    type="number"
                    required
                    placeholder="BDT/mo"
                    value={agRent}
                    onChange={(e) => setAgRent(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl p-2.5 bg-slate-50 text-slate-700 text-sm focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-400 uppercase">Security Deposit *</label>
                  <input
                    type="number"
                    required
                    placeholder="Deposit amount"
                    value={agDeposit}
                    onChange={(e) => setAgDeposit(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl p-2.5 bg-slate-50 text-slate-700 text-sm focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-400 uppercase">Start Date *</label>
                  <input
                    type="date"
                    required
                    value={agStartDate}
                    onChange={(e) => setAgStartDate(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl p-2.5 bg-slate-50 text-slate-700 text-sm focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-400 uppercase">End Date *</label>
                  <input
                    type="date"
                    required
                    value={agEndDate}
                    onChange={(e) => setAgEndDate(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl p-2.5 bg-slate-50 text-slate-700 text-sm focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-400 uppercase">Terms & Conditions</label>
                <textarea
                  placeholder="e.g. Rent due on 5th of each month. 2 months notice period required..."
                  rows="3"
                  value={agTerms}
                  onChange={(e) => setAgTerms(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl p-2.5 bg-slate-50 text-slate-700 text-sm focus:outline-none"
                ></textarea>
              </div>

              <div className="flex gap-3 justify-end pt-2 border-t border-slate-100">
                <Button variant="outline" onClick={() => setShowAgreementModal(false)}>Cancel</Button>
                <Button
                  type="submit"
                  variant="primary"
                  loading={createAgreementMutation.isPending}
                  disabled={!hasEligibleAgreementCandidates}
                >
                  Send Draft
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* GENERATE INVOICE MODAL */}
      {showInvoiceModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-zoomIn border border-slate-100">
            <div className="p-6 bg-slate-50 border-b border-slate-150 flex items-center justify-between">
              <h3 className="font-extrabold text-slate-800 text-lg">Generate Billing Invoice</h3>
              <button onClick={() => setShowInvoiceModal(false)} className="text-slate-400 hover:text-slate-600 bg-white p-1 rounded-full border border-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleInvoiceSubmit} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-400 uppercase">Accepted Agreement *</label>
                <select
                  required
                  value={invAgreementId}
                  onChange={(e) => handleInvoiceAgreementChange(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl p-2.5 bg-slate-50 text-slate-700 text-sm focus:outline-none"
                  disabled={invoiceableAgreements.length === 0}
                >
                  <option value="">Select accepted agreement</option>
                  {invoiceableAgreements.map((agreement) => (
                    <option key={agreement.id} value={agreement.id}>
                      #{agreement.id} — {agreement.property_title} — {agreement.tenant_name || 'Tenant'}
                    </option>
                  ))}
                </select>
                {invoiceableAgreements.length === 0 && (
                  <p className="text-xs text-amber-600 font-semibold mt-1">
                    No accepted agreement found. Generate invoices only after the tenant accepts an agreement.
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-400 uppercase">Billing Amount (BDT) *</label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 25000"
                  value={invAmount}
                  onChange={(e) => setInvAmount(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl p-2.5 bg-slate-50 text-slate-700 text-sm focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-400 uppercase">Due Date *</label>
                <input
                  type="date"
                  required
                  value={invDueDate}
                  onChange={(e) => setInvDueDate(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl p-2.5 bg-slate-50 text-slate-700 text-sm focus:outline-none"
                />
              </div>

              <div className="flex gap-3 justify-end pt-2 border-t border-slate-100">
                <Button variant="outline" onClick={() => setShowInvoiceModal(false)}>Cancel</Button>
                <Button type="submit" variant="primary" loading={createInvoiceMutation.isPending}>
                  Generate Invoice
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </DashboardLayout>
  );
};

export default OwnerDashboard;
