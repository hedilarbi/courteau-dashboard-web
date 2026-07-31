import React, { useEffect, useState } from "react";
import ModalWrapper from "./ModalWrapper";
import { MdOutlineClose } from "react-icons/md";
import Spinner from "../spinner/Spinner";
import { getItemsNames } from "@/services/MenuItemServices";
import SuccessModal from "./SuccessModal";
import FailModal from "./FailModal";
import SpinnerModal from "./SpinnerModal";

import DropDown from "../DropDown";
import { updateRewardService } from "@/services/RewardServices";
import { buildSizesList, isRewardTaken } from "@/utils/rewards";

const UpdateRewardModal = ({
  setShowUpdateRewardModal,
  setRewards,
  rewards,
  reward,
}) => {
  const [item, setItem] = useState(
    reward?.item
      ? { value: reward.item._id, label: reward.item.name }
      : null
  );
  const [size, setSize] = useState(
    reward?.size ? { value: reward.size, label: reward.size } : null
  );
  const [points, setPoints] = useState(reward?.points ?? 0);

  const [isLoading, setIsloading] = useState(true);
  const [itemsNames, setItemsNames] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [error, setError] = useState(null);
  const [updatingIsLoading, setUpdatingIsLoading] = useState(false);
  const [showSuccessModel, setShowSuccessModel] = useState(false);
  const [showFailModel, setShowFailModel] = useState(false);

  const fetchData = async () => {
    try {
      const response = await getItemsNames();
      if (response?.status) {
        let list = [];
        response.data.map((item) => {
          list.push({ value: item._id, label: item.name, prices: item.prices });
        });
        setItemsNames(list);
      } else {
        console.error("Items data not found:", response?.message);
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

  // Les tailles dépendent de l'article. On garde la taille déjà enregistrée
  // tant qu'elle existe toujours dans les prix de l'article sélectionné.
  useEffect(() => {
    // Tant que les articles ne sont pas chargés, on garde la taille pré-remplie.
    if (itemsNames.length === 0) return;

    const selectedItem = itemsNames.find((i) => i.value === item?.value);
    const nextSizes = buildSizesList(selectedItem?.prices);
    setSizes(nextSizes);
    setSize((prev) =>
      nextSizes.some((option) => option.value === prev?.value) ? prev : null
    );
  }, [item, itemsNames]);

  const updateReward = async () => {
    if (!item) {
      setError("article obligatoire");
      setShowFailModel(true);
      return;
    }
    if (!size) {
      setError("taille obligatoire");
      setShowFailModel(true);
      return;
    }
    if (points <= 0) {
      setError("nombre de points obligatoire");
      setShowFailModel(true);
      return;
    }
    if (isRewardTaken(rewards, item.value, size.value, reward._id)) {
      setError("Une récompense existe déjà pour cet article avec cette taille");
      setShowFailModel(true);
      return;
    }
    setError(null);
    setUpdatingIsLoading(true);
    try {
      const response = await updateRewardService(
        reward._id,
        points,
        item.value,
        size.value
      );
      if (response.status) {
        setRewards((prev) =>
          prev.map((current) =>
            current._id === reward._id ? response.data : current
          )
        );
        setUpdatingIsLoading(false);
        setShowSuccessModel(true);
      } else {
        setUpdatingIsLoading(false);
        setError(response.message || "Une erreur s'est produite");
        setShowFailModel(true);
      }
    } catch (err) {
      setUpdatingIsLoading(false);
      setError("Une erreur s'est produite");
      setShowFailModel(true);
    }
  };

  useEffect(() => {
    if (showSuccessModel) {
      const timer = setTimeout(() => {
        setShowSuccessModel(false);
        setShowUpdateRewardModal(false);
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
      {updatingIsLoading && <SpinnerModal />}

      {isLoading ? (
        <div className="w-2/3 bg-white p-4 1/5 overflow-y-auto rounded-md flex items-center justify-center">
          <Spinner />
        </div>
      ) : (
        <div className=" bg-white p-4 w-2/5  overflow-y-auto rounded-md flex flex-col ">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-roboto font-semibold text-text-dark-gray">
              Modifier la recompense
            </h1>
            <button onClick={() => setShowUpdateRewardModal(false)}>
              <MdOutlineClose size={32} />
            </button>
          </div>
          <div className="min-h-6 text-center my-4">
            {error && (
              <p className="text-warning-red text-sm font-roboto font-semibold">
                {error}
              </p>
            )}
          </div>
          <div className="mt-4 flex-1">
            <div className="flex flex-col gap-4">
              <div className="flex gap-2 items-center w-full">
                <label
                  htmlFor="item"
                  className="text-text-dark-gray font-roboto font-semibold w-24"
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
              <div className="flex gap-2 items-center w-full">
                <label
                  htmlFor="size"
                  className="text-text-dark-gray font-roboto font-semibold w-24"
                >
                  Taille
                </label>
                <DropDown
                  value={size}
                  setter={setSize}
                  list={sizes}
                  placeholder={
                    item
                      ? "Selectionner une taille"
                      : "Selectionner d'abord un article"
                  }
                />
              </div>
              <div className="flex gap-2 items-center w-full">
                <label
                  htmlFor="points"
                  className="text-text-dark-gray font-roboto font-semibold w-24"
                >
                  Points
                </label>
                <input
                  type="number"
                  id="points"
                  className="border border-gray-300 rounded-md w-full py-1 px-2 "
                  onChange={(e) => setPoints(e.target.value)}
                  value={points}
                />
              </div>
            </div>
          </div>
          <div className="w-full flex justify-end mt-8">
            <button
              className="bg-pr  rounded-md py-2 font-roboto font-semibold px-10"
              onClick={updateReward}
            >
              Enregistrer
            </button>
          </div>
        </div>
      )}
    </ModalWrapper>
  );
};

export default UpdateRewardModal;
