import { useEffect, useState } from 'react';

import Header from '../../components/Header';
import api from '../../services/api';
import Food from '../../components/Food';
import ModalAddFood from '../../components/ModalAddFood';
import ModalEditFood from '../../components/ModalEditFood';
import { FoodsContainer } from './styles';

interface FoodProps {
  id: number;
  name: string;
  description: string;
  price: number;
  available: boolean;
  image: string;
}

interface DashboardProps {
  foods: FoodProps[];
  // editingFood: {
  //   food: Food;
  //   editModalOpen: Boolean;
  // },
  editingFood: FoodProps;
  editModalOpen: boolean;
  modalOpen: boolean;
}

function Dashboard() {
  const [foods, setFoods] = useState<FoodProps[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingFood, setEditingFood] = useState({} as FoodProps);

  useEffect(() => {
    async function loadFoods() {
      const response = await api.get<FoodProps[]>('/foods');

      setFoods(response.data);
    }

    loadFoods();
  }, []);

  async function handleAddFood(food: FoodProps) {
    try {
      const response = await api.post('/foods', {
        ...food,
        available: true,
      });

      setFoods([...foods, response.data]);
    } catch (err) {
      console.log(err);
    }
  }


  async function handleUpdateFood(food: FoodProps) {
    try {
      const foodUpdated = await api.put(
        `/foods/${editingFood.id}`,
        { ...editingFood, ...food },
      );

      const foodsUpdated = foods.map(f =>
        f.id !== foodUpdated.data.id ? f : foodUpdated.data,
      );

      setFoods(foodsUpdated);
    } catch (err) {
      console.log({ error: "Error updating food!" });
      console.log(err);
    }
  }

  async function handleDeleteFood(id: number) {
    //const { foods } = this.state;

    await api.delete(`/foods/${id}`);

    const foodsFiltered = foods.filter(food => food.id !== id);

    setFoods(foodsFiltered);
  }

  function toggleModal() {
    //const { modalOpen } = this.state;

    setModalOpen(!modalOpen);
  }

  function toggleEditModal() {
    //const { editModalOpen } = this.state;

    setEditModalOpen(!editModalOpen);
  }

  function handleEditFood(food: FoodProps) {
    handleUpdateFood(food);
    setEditModalOpen(true);

    const foodForEditing = foods.find(f => f.id === food.id);

    if (!foodForEditing) {
      throw Error()
    }

    setEditingFood(foodForEditing);
  }

  return (
    <>
      <Header openModal={toggleModal} />
      <ModalAddFood
        isOpen={modalOpen}
        setIsOpen={toggleModal}
        handleAddFood={handleAddFood}
      />
      <ModalEditFood
        isOpen={editModalOpen}
        setIsOpen={toggleEditModal}
        editingFood={editingFood}
        handleUpdateFood={handleUpdateFood}
      />

      <FoodsContainer data-testid="foods-list">
        {foods &&
          foods.map(food => (
            <Food
              key={food.id}
              food={food}
              handleDelete={handleDeleteFood}
              handleEditFood={handleEditFood}
            />
          ))}
      </FoodsContainer>
    </>
  );
};

export default Dashboard;
