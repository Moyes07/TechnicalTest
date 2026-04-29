import { useDashboardData } from "./hooks/useDashboardData";
import { Loader } from "./components/Loader";
import { StudentCard } from "./components/StudentCard";
import { ParentCard } from "./components/ParentCard";
import { MenuList } from "./components/MenuList";
import { OrderSummary } from "./components/OrderSummary";
import { OrderHistory } from "./components/OrderHistory";

const App = () => {
  const {
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
    submitOrder,
  } = useDashboardData();

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-8 min-h-screen animate-fade-in">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-br from-text-primary to-accent bg-clip-text text-transparent mb-2">
          Order Dashboard
        </h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <StudentCard
          activeStudent={activeStudent}
          students={students}
          selectedStudentId={selectedStudentId}
          setSelectedStudentId={setSelectedStudentId}
        />
        <ParentCard activeParent={activeParent} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <div className="flex flex-col gap-6">
          <MenuList
            menuItems={menuItems}
            cartQuantities={cartQuantities}
            incrementCartItem={incrementCartItem}
            decrementCartItem={decrementCartItem}
          />

          <OrderSummary
            selectedItems={selectedItems}
            orderTotal={orderTotal}
            isSubmitting={isSubmitting}
            orderResponse={orderResponse}
            submitOrder={submitOrder}
          />
        </div>

        <OrderHistory orders={orders} />
      </div>
    </div>
  );
};

export default App;