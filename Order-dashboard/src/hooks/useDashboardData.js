import { useState, useEffect, useCallback } from "react";

const API_BASE = import.meta.env.API_BASE ?? "http://localhost:3000";

export const useDashboardData = () => {
  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [parents, setParents] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [cartQuantities, setCartQuantities] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderResponse, setOrderResponse] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [studentsResponse, parentsResponse, menuResponse, ordersResponse] = await Promise.all([
        fetch(`${API_BASE}/students`),
        fetch(`${API_BASE}/parents`),
        fetch(`${API_BASE}/menu`),
        fetch(`${API_BASE}/orders`),
      ]);
      
      const [studentsData, parentsData, menuData, ordersData] = await Promise.all([
        studentsResponse.json(),
        parentsResponse.json(),
        menuResponse.json(),
        ordersResponse.json(),
      ]);

      setStudents(studentsData);
      setParents(parentsData);
      setMenuItems(menuData);
      setOrders(ordersData);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const activeStudent = selectedStudentId 
    ? students.find((student) => student.id === selectedStudentId) || students[0] || null
    : students[0] || null;
  const activeParent = activeStudent ? parents.find((parent) => parent.id === activeStudent.parentId) : null;

  const incrementCartItem = (itemId) => {
    setCartQuantities((previousQuantities) => ({
      ...previousQuantities,
      [itemId]: (previousQuantities[itemId] || 0) + 1
    }));
  };

  const decrementCartItem = (itemId) => {
    setCartQuantities((previousQuantities) => {
      const currentQuantity = previousQuantities[itemId] || 0;
      if (currentQuantity <= 0) return previousQuantities;
      
      const updatedQuantities = { ...previousQuantities, [itemId]: currentQuantity - 1 };
      if (updatedQuantities[itemId] === 0) {
        delete updatedQuantities[itemId];
      }
      return updatedQuantities;
    });
  };

  const selectedItems = menuItems
    .filter((item) => cartQuantities[item.id] > 0)
    .map((item) => ({
      ...item,
      quantity: cartQuantities[item.id],
      lineTotal: parseFloat((item.price * cartQuantities[item.id]).toFixed(2)),
    }));

  const orderTotal = parseFloat(
    selectedItems.reduce((total, item) => total + item.lineTotal, 0).toFixed(2)
  );

  const submitOrder = async () => {
    if (selectedItems.length === 0) {
      setOrderResponse({ type: "error", message: "Please select at least one item." });
      return;
    }

    try {
      setIsSubmitting(true);
      setOrderResponse(null);
      
      const response = await fetch(`${API_BASE}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: activeStudent.id,
          items: selectedItems.map((item) => ({ 
            menuItemId: item.id, 
            quantity: item.quantity 
          })),
        }),
      });
      
      const responseData = await response.json();
      
      if (!response.ok) {
        setOrderResponse({ type: "error", message: responseData.message || "Failed to process order" });
      } else {
        setOrderResponse({
          type: "success",
          message: `Order ${responseData.id} confirmed — Rs.${responseData.total.toFixed(2)} deducted from wallet.`,
        });
        setCartQuantities({});
        fetchData();
      }
    } catch (error) {
      setOrderResponse({ type: "error", message: "Connection failed. Please try again." });
      console.log(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    students,
    selectedStudentId,
    setSelectedStudentId,
    activeStudent,
    activeParent,
    menuItems,
    orders,
    cartQuantities,
    selectedItems,
    orderTotal,
    isLoading,
    isSubmitting,
    orderResponse,
    incrementCartItem,
    decrementCartItem,
    submitOrder
  };
};
