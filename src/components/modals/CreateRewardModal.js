import React, { useEffect, useState } from "react";
import ModalWrapper from "./ModalWrapper";
import { MdOutlineClose } from "react-icons/md";
import Spinner from "../spinner/Spinner";
import { getItemsNames } from "@/services/MenuItemServices";
import SuccessModal from "./SuccessModal";
import FailModal from "./FailModal";
import SpinnerModal from "./SpinnerModal";

import DropDown from "../DropDown";
import { createRewardService } from "@/services/RewardServices";

const CreateRewardModal = ({ setShowCreateRewardModal, setRewards }) => {
  const [item, setItem] = useState(null);
  const [points, setPoints] = useState(0);

  const [isLoading, setIsloading] = useState(true);
  const [itemsNames, setItemsNames] = useState([]);
  const [error, setError] = useState(null);
  const [addingIsLoading, setAddingIsLoading] = useState(false);
  const [showSuccessModel, setShowSuccessModel] = useState(false);
  const [showFailModel, setShowFailModel] = useState(false);

  const fetchData = async () => {
    try {
      const response = await getItemsNames();
      if (response?.status) {
        let list = [];
        response.data.map((item) => {
          list.push({ value: item._id, label: item.name });
        });
        setItemsNames(list);
      } else {
        console.error("Categories data not found:", categoriesResponse.message);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsloading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const createReward = async () => {
    if (!item) {
      setError("article obligatoire");
      setShowFailModel(true);
      return;
    }
    if (points <= 0) {
      setError("nombre de points obligatoire");
      setShowFailModel(true);
      return;
    }
    setAddingIsLoading(true);
    try {
      const response = await createRewardService(points, item.value);
      if (response.status) {
        setRewards((prev) => [response.data, ...prev]);
        setAddingIsLoading(false);
        setShowSuccessModel(true);
      } else {
        setAddingIsLoading(false);
        setError("Une erreu s'est produite");
        setShowFailModel(true);
      }
    } catch (err) {
      setAddingIsLoading(false);
      setError("Une erreu s'est produite");
      setShowFailModel(true);
    }
  };
  useEffect(() => {
    if (showSuccessModel) {
      const timer = setTimeout(() => {
        setShowSuccessModel(false);
        setShowCreateRewardModal(false);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [showSuccessModel]);
  useEffect(() => {
    if (showFailModel) {
      const timer = setTimeout(() => {
        setShowFailModel(false);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [showFailModel]);
  return (
    <ModalWrapper zindex={10}>
      {showSuccessModel && <SuccessModal />}
      {showFailModel && <FailModal error={error} />}
      {addingIsLoading && <SpinnerModal />}

      {isLoading ? (
        <div className="w-2/3 bg-white p-4 1/5 overflow-y-auto rounded-md flex items-center justify-center">
          <Spinner />
        </div>
      ) : (
        <div className=" bg-white p-4 w-2/5  overflow-y-auto rounded-md flex flex-col ">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-roboto font-semibold text-text-dark-gray">
              Creer une recompense
            </h1>
            <button onClick={() => setShowCreateRewardModal(false)}>
              <MdOutlineClose size={32} />
            </button>
          </div>
          <div className="h-6 text-center my-4">
            {error && (
              <p className="text-warning-red text-sm font-roboto font-semibold">
                {error}
              </p>
            )}
          </div>
          <div className="mt-4   flex-1 ">
            <div className="flex w-4/5  ">
              <div className="ml-4 flex flex-col justify-between flex-1 w-full">
                <div className=" flex gap-2 items-center w-full">
                  <label
                    htmlFor="name"
                    className="text-text-dark-gray font-roboto font-semibold"
                  >
                    Article
                  </label>
                  <DropDown
                    value={item}
                    setter={setItem}
                    list={itemsNames}
                    placeholder={"Selectionner un article"}
                  />
                </div>
                <div className="flex gap-2 items-center mt-4">
                  <label
                    htmlFor="description"
                    className="text-text-dark-gray font-roboto font-semibold"
                  >
                    Points
                  </label>
                  <input
                    type="number"
                    id="name"
                    className="border border-gray-300 rounded-md w-full py-1 px-2 "
                    onChange={(e) => setPoints(e.target.value)}
                    value={points}
                  />
                </div>
              </div>
            </div>
          </div>
          <div
            className="w-full flex justify-end mt-8    "
            onClick={createReward}
          >
            <button className="bg-pr  rounded-md py-2 font-roboto font-semibold px-10">
              Ajouter
            </button>
          </div>
        </div>
      )}
    </ModalWrapper>
  );
};

export default CreateRewardModal;
