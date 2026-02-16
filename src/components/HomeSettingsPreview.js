import React from "react";

const PREVIEW_WIDTH = 320;
const PREVIEW_HEIGHT = 600;
const HERO_HEIGHT = 350;

const formatPromoDisplay = (promoCode) => {
  if (!promoCode?.value) {
    return { value: "25%", label: "DE RABAIS", isFreeItem: false };
  }

  if (promoCode.type === "percent" && typeof promoCode.percent === "number") {
    return { value: `${promoCode.percent}%`, label: "DE RABAIS", isFreeItem: false };
  }

  if (promoCode.type === "amount" && typeof promoCode.amount === "number") {
    const amount = Number(promoCode.amount);
    const formatted = amount % 1 === 0 ? amount.toFixed(0) : amount.toFixed(2);
    return { value: `${formatted}$`, label: "DE RABAIS", isFreeItem: false };
  }

  if (promoCode.type === "free_item") {
    const freeItemName =
      typeof promoCode?.freeItemName === "string"
        ? promoCode.freeItemName.trim()
        : typeof promoCode?.freeItem?.name === "string"
          ? promoCode.freeItem.name.trim()
          : "";
    return {
      value: freeItemName || "Article offert",
      label: "OFFERT",
      isFreeItem: true,
    };
  }

  return { value: "25%", label: "DE RABAIS", isFreeItem: false };
};

const HomeSettingsPreview = ({
  title,
  subTitle,
  codePromoTitle,
  imagePreview,
  promoCode,
}) => {
  const hasPromoCode = Boolean(promoCode?.value);
  const promoDisplay = formatPromoDisplay(promoCode);
  const promoCodeLabel = hasPromoCode ? promoCode.label : "TOP5";
  const showImage = Boolean(imagePreview);
  const heroTitle = (title || "Poutine Sphère").toUpperCase();
  const heroSubtitle = subTitle || "Offre du moment";
  const promoTitle = codePromoTitle || "OFFRE DU MOMENT";

  return (
    <div className="w-full flex justify-center">
      <div
        className="relative shrink-0 rounded-[30px] border border-gray-300 overflow-hidden shadow-xl bg-[#F6F6F6]"
        style={{ width: PREVIEW_WIDTH, height: PREVIEW_HEIGHT }}
      >
        <div className="absolute inset-x-0 top-0 bottom-[74px] overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div
            className="relative w-full bg-[#1d1d1d] bg-cover bg-center"
            style={
              showImage
                ? {
                    backgroundImage: `url(${imagePreview})`,
                    height: HERO_HEIGHT,
                  }
                : {
                    height: HERO_HEIGHT,
                    backgroundImage:
                      "linear-gradient(135deg, #313131 0%, #111111 45%, #2a2a2a 100%)",
                  }
            }
          >
            <div className="absolute inset-0 bg-black/45" />

            <div className="relative z-10 h-full px-5 pt-[14px] pb-3 flex flex-col">
              <div className="mb-2 flex justify-center">
                <img
                  src="/logo.png"
                  alt="Courteau"
                  className="h-[46px] w-auto object-contain"
                />
              </div>

              <div className="flex-1 text-white text-center flex flex-col justify-between">
                <div>
                  <p className="text-[13px] font-bold">
                    Ouvert jusqu&apos;à 22:00
                  </p>
                  <h3 className="mt-1 text-[28px] leading-[31px] font-black tracking-[0.2px]">
                    {heroTitle}
                  </h3>
                  <p className="mt-1 text-[16px] font-bold">{heroSubtitle}</p>
                </div>

                <div className="flex justify-center">
                  <div className="rounded-full bg-[#F7A600] text-black px-[24px] py-[10px] text-[15px] font-bold">
                    Commander maintenant
                  </div>
                </div>
              </div>

              <div className="mt-3 rounded-[14px] border border-white/20 bg-black/30 px-[10px] py-2.5 text-white">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[14px] leading-[17px] font-bold uppercase break-words">
                      {promoTitle}
                    </p>
                    <p className="text-[12px] mt-0.5">
                      Code:{" "}
                      <span className="font-bold text-[#F7A600]">
                        {promoCodeLabel}
                      </span>
                    </p>
                  </div>
                  {promoDisplay.isFreeItem ? (
                    <div className="text-right shrink-0 max-w-[120px]">
                      <p className="text-[13px] leading-[15px] font-black uppercase break-words">
                        {promoDisplay.value}
                      </p>
                      <p className="text-[10px] font-bold mt-1">
                        {promoDisplay.label}
                      </p>
                    </div>
                  ) : (
                    <div className="text-right shrink-0 flex items-end gap-1">
                      <p className="text-[32px] leading-[36px] font-black">
                        {promoDisplay.value}
                      </p>
                      <p className="text-[11px] font-bold pb-0.5">
                        {promoDisplay.label}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="px-3 pt-3 pb-4 bg-[#F6F6F6]">
            <p
              className="text-[21px] leading-[24px] mb-1.5 text-[#121212]"
              style={{ fontFamily: '"Bebas Neue", "Arial Narrow", sans-serif' }}
            >
              NOUVEAUTE
            </p>
            <div className="h-[38px] rounded-[10px] border border-[#e8e8e8] bg-white" />

            <p
              className="mt-3 text-[21px] leading-[24px] mb-1.5 text-[#121212]"
              style={{ fontFamily: '"Bebas Neue", "Arial Narrow", sans-serif' }}
            >
              EXPLORER LE MENU
            </p>
            <div className="h-[34px] rounded-[10px] border border-[#e8e8e8] bg-white" />

            <p
              className="mt-3 text-[21px] leading-[24px] mb-1.5 text-[#121212]"
              style={{ fontFamily: '"Bebas Neue", "Arial Narrow", sans-serif' }}
            >
              OFFRES
            </p>
            <div className="h-[42px] rounded-[10px] border border-[#e8e8e8] bg-white" />
          </div>
        </div>

        <div className="absolute left-0 right-0 bottom-0 px-3 pb-2">
          <div className="h-[66px] rounded-[14px] border border-[#e9e9e9] bg-white px-4 flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-wide text-[#8a8a8a] font-semibold">
                Adresse actuelle
              </p>
              <p className="text-[13px] text-[#1a1a1a] font-bold truncate">
                123 Rue Principale
              </p>
            </div>
            <div className="h-9 w-9 rounded-full bg-[#F7A600]/20 border border-[#F7A600] flex items-center justify-center text-[#111] text-[18px]">
              +
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeSettingsPreview;
