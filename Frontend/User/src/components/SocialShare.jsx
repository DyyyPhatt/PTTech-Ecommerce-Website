import React from "react";
import {
  FacebookShareButton,
  FacebookIcon,
  TwitterShareButton,
  TwitterIcon,
  LinkedinShareButton,
  LinkedinIcon,
  RedditShareButton,
  RedditIcon,
  PinterestShareButton,
  PinterestIcon,
  TelegramShareButton,
  TelegramIcon,
  WhatsappShareButton,
  WhatsappIcon,
  EmailShareButton,
  EmailIcon,
} from "react-share";

const SocialShare = ({ productUrl, productTitle, productImage }) => {
  return (
    <div className="social-share-container">
      <FacebookShareButton
        url={productUrl}
        quote={productTitle}
        className="share-btn"
      >
        <FacebookIcon size={48} round />
      </FacebookShareButton>

      <TwitterShareButton
        url={productUrl}
        title={productTitle}
        className="share-btn"
      >
        <TwitterIcon size={48} round />
      </TwitterShareButton>

      <LinkedinShareButton
        url={productUrl}
        title={productTitle}
        className="share-btn"
      >
        <LinkedinIcon size={48} round />
      </LinkedinShareButton>

      <RedditShareButton
        url={productUrl}
        title={productTitle}
        className="share-btn"
      >
        <RedditIcon size={48} round />
      </RedditShareButton>

      <PinterestShareButton
        url={productUrl}
        media={productImage}
        description={productTitle}
        className="share-btn"
      >
        <PinterestIcon size={48} round />
      </PinterestShareButton>

      <TelegramShareButton
        url={productUrl}
        title={productTitle}
        className="share-btn"
      >
        <TelegramIcon size={48} round />
      </TelegramShareButton>

      <WhatsappShareButton
        url={productUrl}
        title={productTitle}
        separator=" - "
        className="share-btn"
      >
        <WhatsappIcon size={48} round />
      </WhatsappShareButton>

      <EmailShareButton
        url={productUrl}
        subject={productTitle}
        body="Check out this product:"
        className="share-btn"
      >
        <EmailIcon size={48} round />
      </EmailShareButton>
    </div>
  );
};

export default SocialShare;
